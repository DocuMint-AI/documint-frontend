"""
Document handling routes for upload, processing, and AI analysis
"""

import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, Dict, Any

from auth.routes import get_current_user
from documents.parser import DocumentParser
from documents.storage import DocumentStorage
from ai.gemini_client import GeminiClient
from utils.response import success_response, error_response
from utils.errors import DocumentError, AIServiceError
from config import config


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
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload and parse a document"""
    try:
        # Validate file size
        if hasattr(file, 'size') and file.size and file.size > config.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {config.MAX_FILE_SIZE} bytes"
            )
        
        # Check file extension
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No filename provided"
            )
        
        file_extension = DocumentParser.get_file_extension(file.filename)
        if file_extension not in config.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type '{file_extension}' not supported"
            )
        
        # Get user session info (assume latest session for now)
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active session found"
            )
        
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
            if needs_ocr and config.GOOGLE_CLOUD_VISION_CREDENTIALS:
                try:
                    from ai.vision_ocr import VisionOCR
                    vision_client = VisionOCR()
                    ocr_text, ocr_data = vision_client.extract_text(saved_file_path)
                    
                    # Save OCR results
                    DocumentStorage.save_ocr_results(
                        user_id, session_uid, doc_id, ocr_text, ocr_data
                    )
                    
                    # Update metadata to indicate OCR was processed
                    metadata["ocr_processed"] = True
                    metadata["ocr_text_length"] = len(ocr_text)
                    
                except Exception as e:
                    # OCR failed, but document upload succeeded
                    metadata["ocr_error"] = str(e)
                    needs_ocr = True  # Still needs OCR
            
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
    
    except DocumentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )


@documents_router.post("/process-document")
async def process_document(
    request: ProcessDocumentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Process document with Gemini AI for insights and analysis"""
    try:
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active session found"
            )
        
        # Get document text
        document_text = DocumentStorage.get_document_text(user_id, session_uid, request.doc_id)
        if not document_text:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or no text content available"
            )
        
        # Check if Gemini API is configured
        if not config.GEMINI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini API not configured"
            )
        
        # Process with Gemini
        gemini_client = GeminiClient()
        analysis_result = await gemini_client.analyze_document(request.doc_id, document_text)
        
        # Save analysis results
        DocumentStorage.save_analysis_results(user_id, session_uid, analysis_result)
        
        return success_response(analysis_result, "Document analysis completed")
    
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )


@documents_router.post("/qa")
async def document_qa(
    request: QARequest,
    current_user: dict = Depends(get_current_user)
):
    """Answer questions about a document using Gemini AI"""
    try:
        user_id = current_user["user_id"]
        session_uid = max(current_user["sessions"].keys()) if current_user["sessions"] else None
        
        if not session_uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active session found"
            )
        
        # Get document text
        document_text = DocumentStorage.get_document_text(user_id, session_uid, request.doc_id)
        if not document_text:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or no text content available"
            )
        
        # Check if Gemini API is configured
        if not config.GEMINI_API_KEY:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Gemini API not configured"
            )
        
        # Process Q&A with Gemini
        gemini_client = GeminiClient()
        qa_result = await gemini_client.answer_question(
            request.doc_id, document_text, request.query
        )
        
        return success_response(qa_result, "Question answered successfully")
    
    except AIServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )


@documents_router.get("/documents")
async def list_documents(current_user: dict = Depends(get_current_user)):
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