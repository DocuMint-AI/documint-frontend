"""
Document handling routes for upload, processing, and AI analysis
"""

import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any

# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

from auth.routes import get_current_user
from documents.parser import DocumentParser
from documents.storage import DocumentStorage
from ai.dynamic_gemini_client import DynamicGeminiClient
from utils.response import success_response, error_response
from utils.errors import DocumentError, AIServiceError, AuthenticationError, FileValidationError
from config import config

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


class ProcessDocumentRequest(BaseModel):
    doc_id: str


class QARequest(BaseModel):
    doc_id: str
    query: str


class DocumentUploadResponse(BaseModel):
    doc_id: str
    filename: str
    needs_ocr: bool
    metadata: Dict[str, Any]


documents_router = APIRouter()


@documents_router.post("/upload", response_model=DocumentUploadResponse)
@limiter.limit("20/minute")  # Limit document uploads
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload and parse a document"""
    try:
        # Validate file size
        if hasattr(file, 'size') and file.size and file.size > config.MAX_FILE_SIZE:
            raise FileValidationError(
                f"File too large. Maximum size is {config.MAX_FILE_SIZE} bytes",
                "FILE_TOO_LARGE"
            )
        
        # Check file extension
        if not file.filename:
            raise FileValidationError("No filename provided", "FILENAME_MISSING")
        
        file_extension = DocumentParser.get_file_extension(file.filename)
        if file_extension not in config.ALLOWED_EXTENSIONS:
            raise FileValidationError(
                f"File type '{file_extension}' not supported. Allowed types: {', '.join(config.ALLOWED_EXTENSIONS)}",
                "UNSUPPORTED_FILE_TYPE"
            )
        
        # Get user session info (assume latest session for now)
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise AuthenticationError("No active session found", "NO_ACTIVE_SESSION")
        
        # Save uploaded file to temporary location first
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Parse the document
            text_content, metadata, needs_ocr = DocumentParser.parse_document(temp_file_path)
            
            # Save file to user's session directory
            doc_id, saved_file_path = DocumentStorage.save_uploaded_file(
                temp_file_path, user_id, session_uid, file.filename
            )
            
            # Save metadata
            DocumentStorage.save_metadata(
                user_id, session_uid, doc_id, metadata, file.filename
            )
            
            # If OCR is needed and we have Vision API configured, process it
            if needs_ocr:
                logger.info(f"Document {doc_id} requires OCR processing. Vision API configured: {bool(config.GOOGLE_CLOUD_VISION_CREDENTIALS)}")
                
                if config.GOOGLE_CLOUD_VISION_CREDENTIALS:
                    try:
                        logger.info(f"Starting OCR processing for document {doc_id}")
                        from ai.vision_ocr import VisionOCR
                        vision_client = VisionOCR()
                        logger.info(f"Vision client initialized successfully for document {doc_id}")
                        
                        ocr_text, ocr_data = vision_client.extract_text(saved_file_path)
                        logger.info(f"OCR completed for document {doc_id}. Text length: {len(ocr_text)} characters")
                        
                        # Save OCR results
                        DocumentStorage.save_ocr_results(
                            user_id, session_uid, doc_id, ocr_text, ocr_data
                        )
                        logger.info(f"OCR results saved for document {doc_id}")
                        
                        # Update metadata to indicate OCR was processed
                        metadata["ocr_processed"] = True
                        metadata["ocr_text_length"] = len(ocr_text)
                        metadata["ocr_status"] = "success"
                        logger.info(f"OCR processing completed successfully for document {doc_id}")
                        
                    except Exception as e:
                        # OCR failed, but document upload succeeded
                        logger.error(f"OCR processing failed for document {doc_id}: {str(e)}", exc_info=True)
                        metadata["ocr_error"] = str(e)
                        metadata["ocr_status"] = "failed"
                        metadata["ocr_fallback_message"] = "OCR processing failed. We are working on fixing this issue. Your document was uploaded successfully but text extraction may be limited."
                        needs_ocr = True  # Still needs OCR
                        logger.warning(f"Document {doc_id} uploaded successfully but OCR failed. User will see fallback message.")
                else:
                    logger.warning(f"Document {doc_id} requires OCR but Vision API credentials not configured")
                    metadata["ocr_status"] = "not_configured"
                    metadata["ocr_fallback_message"] = "OCR service is currently being configured. We are working on enabling text extraction for image-based documents."
                    logger.info(f"OCR not available for document {doc_id} - credentials not configured")
            
            return DocumentUploadResponse(
                doc_id=doc_id,
                filename=file.filename,
                needs_ocr=needs_ocr and not metadata.get("ocr_processed", False),
                metadata=metadata
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)


@documents_router.post("/process-document")
@limiter.limit("35/minute")  # Limit intensive AI processing
async def process_document(
    request: Request,
    request_data: ProcessDocumentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Process document with Gemini AI for insights and analysis"""
    logger.info(f"Processing document request for {request_data.doc_id}")
    try:
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise AuthenticationError("No active session found", "NO_ACTIVE_SESSION")
        
        # Get document text
        logger.info(f"Retrieving document text for processing {request_data.doc_id}")
        document_text = DocumentStorage.get_document_text(user_id, session_uid, request_data.doc_id)
        if not document_text:
            logger.error(f"Document {request_data.doc_id} not found or no text content available for processing")
            raise DocumentError("Document not found or no text content available", "DOCUMENT_NOT_FOUND")
        
        logger.info(f"Document {request_data.doc_id} text retrieved successfully for processing. Length: {len(document_text)} characters")
        
        # Check if Gemini API is configured
        if not config.GEMINI_API_KEY:
            raise AIServiceError("AI analysis service is currently unavailable", "GEMINI_API_KEY_MISSING")
        
        # Process with Dynamic Gemini Client
        gemini_client = DynamicGeminiClient()
        analysis_result = await gemini_client.analyze_document_dynamic(request_data.doc_id, document_text)
        
        # Save analysis results
        DocumentStorage.save_analysis_results(user_id, session_uid, analysis_result)
        
        return success_response(analysis_result, "Document analysis completed")


@documents_router.post("/qa")
@limiter.limit("50/minute")  # Limit Q&A requests
async def document_qa(
    request: Request,
    request_data: QARequest,
    current_user: dict = Depends(get_current_user)
):
    """Answer questions about a document using Gemini AI"""
    logger.info(f"Q&A request for document {request_data.doc_id} with query: {request_data.query[:100]}...")
    try:
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise AuthenticationError("No active session found", "NO_ACTIVE_SESSION")
        
        # Get document text
        logger.info(f"Retrieving document text for Q&A on {request_data.doc_id}")
        document_text = DocumentStorage.get_document_text(user_id, session_uid, request_data.doc_id)
        if not document_text:
            logger.error(f"Document {request_data.doc_id} not found for Q&A or no text content available")
            raise DocumentError("Document not found or no text content available", "DOCUMENT_NOT_FOUND")
        
        logger.info(f"Document {request_data.doc_id} text retrieved for Q&A. Length: {len(document_text)} characters")
        
        # Check if Gemini API is configured
        if not config.GEMINI_API_KEY:
            raise AIServiceError("AI analysis service is currently unavailable", "GEMINI_API_KEY_MISSING")
        
        # Process Q&A with Dynamic Gemini Client
        gemini_client = DynamicGeminiClient()
        qa_result = await gemini_client.answer_question(
            request_data.doc_id, document_text, request_data.query
        )
        
        return success_response(qa_result, "Question answered successfully")


@documents_router.get("/documents")
@limiter.limit("30/minute")  # Allow frequent document listing
async def list_documents(request: Request, current_user: dict = Depends(get_current_user)):
    """List all documents in current session"""
    try:
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            return success_response([], "No active session")
        
        # Get session directory
        from auth.utils import get_session_path
        session_dir = get_session_path(user_id, session_uid)
        metadata_file = os.path.join(session_dir, "metadata.json")
        
        if not os.path.exists(metadata_file):
            return success_response([], "No documents found")
        
        # Load and return metadata
        import json
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)
        
        return success_response(list(metadata.values()), "Documents retrieved successfully")
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving documents: {str(e)}"
        )


@documents_router.get("/text/{doc_id}")
@limiter.limit("100/minute")  # Allow frequent text retrieval
async def get_document_text(
    request: Request,
    doc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get the extracted text content of a document"""
    try:
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active session found"
            )
        
        # Get document text (OCR text if available, otherwise parsed text)
        document_text = DocumentStorage.get_document_text(user_id, session_uid, doc_id)
        if not document_text:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or no text content available"
            )
        
        # Get document metadata for additional info
        metadata = DocumentStorage.get_document_metadata(user_id, session_uid, doc_id)
        
        # Calculate basic stats
        word_count = len(document_text.split())
        page_count = metadata.get("page_count") if metadata else None
        
        response_data = {
            "doc_id": doc_id,
            "text": document_text,
            "word_count": word_count,
            "page_count": page_count,
            "filename": metadata.get("filename") if metadata else None
        }
        
        return success_response(response_data, "Document text retrieved successfully")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving document text: {str(e)}"
        )