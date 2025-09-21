"""
Document storage utilities for saving files and metadata
"""

import os
import json
import uuid
import shutil
from typing import Dict, Any, Optional, Tuple
from datetime import datetime

from config import config
from auth.utils import get_session_path


class DocumentStorage:
    """Handle document storage and metadata management"""
    
    @staticmethod
    def generate_document_id() -> str:
        """Generate a unique document ID"""
        return str(uuid.uuid4())
    
    @staticmethod
    def save_uploaded_file(
        file_path: str, 
        user_id: str, 
        session_uid: str, 
        original_filename: str
    ) -> Tuple[str, str]:
        """
        Save uploaded file to user's session directory
        Returns: (doc_id, saved_file_path)
        """
        doc_id = DocumentStorage.generate_document_id()
        session_dir = get_session_path(user_id, session_uid)
        
        # Create session directory if it doesn't exist
        os.makedirs(session_dir, exist_ok=True)
        
        # Get file extension
        file_extension = original_filename.split('.')[-1] if '.' in original_filename else ''
        
        # Create new filename with doc_id
        new_filename = f"{doc_id}.{file_extension}"
        destination_path = os.path.join(session_dir, new_filename)
        
        # Copy file to destination
        shutil.copy2(file_path, destination_path)
        
        return doc_id, destination_path
    
    @staticmethod
    def save_metadata(
        user_id: str, 
        session_uid: str, 
        doc_id: str, 
        metadata: Dict[str, Any],
        original_filename: str
    ) -> str:
        """Save document metadata to metadata.json"""
        session_dir = get_session_path(user_id, session_uid)
        metadata_file = os.path.join(session_dir, "metadata.json")
        
        # Load existing metadata or create new
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                all_metadata = json.load(f)
        else:
            all_metadata = {}
        
        # Add new document metadata
        all_metadata[doc_id] = {
            "doc_id": doc_id,
            "original_filename": original_filename,
            "uploaded_at": datetime.utcnow().isoformat(),
            "metadata": metadata
        }
        
        # Save updated metadata
        with open(metadata_file, 'w') as f:
            json.dump(all_metadata, f, indent=2)
        
        return metadata_file
    
    @staticmethod
    def save_ocr_results(
        user_id: str, 
        session_uid: str, 
        doc_id: str, 
        ocr_text: str,
        ocr_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Save OCR results to {doc_id}_ocr.json"""
        session_dir = get_session_path(user_id, session_uid)
        ocr_file = os.path.join(session_dir, f"{doc_id}_ocr.json")
        
        ocr_results = {
            "doc_id": doc_id,
            "ocr_text": ocr_text,
            "ocr_data": ocr_data or {},
            "processed_at": datetime.utcnow().isoformat()
        }
        
        with open(ocr_file, 'w') as f:
            json.dump(ocr_results, f, indent=2)
        
        return ocr_file
    
    @staticmethod
    def save_analysis_results(
        user_id: str, 
        session_uid: str, 
        analysis_data: Dict[str, Any]
    ) -> str:
        """Save AI analysis results to analysis.json"""
        session_dir = get_session_path(user_id, session_uid)
        analysis_file = os.path.join(session_dir, "analysis.json")
        
        # Load existing analysis or create new
        if os.path.exists(analysis_file):
            with open(analysis_file, 'r') as f:
                all_analysis = json.load(f)
        else:
            all_analysis = {}
        
        doc_id = analysis_data.get("doc_id")
        if doc_id:
            all_analysis[doc_id] = {
                **analysis_data,
                "analyzed_at": datetime.utcnow().isoformat()
            }
        
        with open(analysis_file, 'w') as f:
            json.dump(all_analysis, f, indent=2)
        
        return analysis_file
    
    @staticmethod
    def get_document_path(user_id: str, session_uid: str, doc_id: str) -> Optional[str]:
        """Get the full path to a document file"""
        session_dir = get_session_path(user_id, session_uid)
        
        # Look for file with doc_id prefix
        if os.path.exists(session_dir):
            for filename in os.listdir(session_dir):
                if filename.startswith(doc_id) and '.' in filename:
                    return os.path.join(session_dir, filename)
        
        return None
    
    @staticmethod
    def get_document_metadata(user_id: str, session_uid: str, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a specific document"""
        session_dir = get_session_path(user_id, session_uid)
        metadata_file = os.path.join(session_dir, "metadata.json")
        
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r') as f:
                all_metadata = json.load(f)
                return all_metadata.get(doc_id)
        
        return None
    
    @staticmethod
    def get_document_text(user_id: str, session_uid: str, doc_id: str) -> Optional[str]:
        """Get document text (from original parse or OCR)"""
        # First try to get OCR text
        session_dir = get_session_path(user_id, session_uid)
        ocr_file = os.path.join(session_dir, f"{doc_id}_ocr.json")
        
        if os.path.exists(ocr_file):
            with open(ocr_file, 'r') as f:
                ocr_data = json.load(f)
                return ocr_data.get("ocr_text", "")
        
        # If no OCR file, try to parse the document again
        doc_path = DocumentStorage.get_document_path(user_id, session_uid, doc_id)
        if doc_path:
            from documents.parser import DocumentParser
            try:
                text_content, _, _ = DocumentParser.parse_document(doc_path)
                return text_content
            except Exception:
                return None
        
        return None