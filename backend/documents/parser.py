"""
Document parsing utilities for PDF, DOC, DOCX files and metadata extraction
"""

import os
import fitz  # PyMuPDF
import docx2txt
from docx import Document
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import json
from PIL import Image

from utils.errors import DocumentError


class DocumentParser:
    """Document parser for various file formats"""
    
    @staticmethod
    def get_file_extension(filename: str) -> str:
        """Get file extension in lowercase"""
        return filename.lower().split('.')[-1] if '.' in filename else ''
    
    @staticmethod
    def validate_file(file_path: str, max_size: int = 10 * 1024 * 1024) -> Tuple[bool, str]:
        """Validate file type and size"""
        if not os.path.exists(file_path):
            return False, "File does not exist"
        
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size > max_size:
            return False, f"File size ({file_size} bytes) exceeds maximum allowed size ({max_size} bytes)"
        
        # Check file extension
        allowed_extensions = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}
        extension = DocumentParser.get_file_extension(file_path)
        if extension not in allowed_extensions:
            return False, f"File type '{extension}' not supported. Allowed types: {allowed_extensions}"
        
        return True, "Valid file"
    
    @staticmethod
    def extract_pdf_text(file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract text from PDF file"""
        try:
            doc = fitz.open(file_path)
            text_content = ""
            page_count = doc.page_count
            has_text = False
            
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                page_text = page.get_text()
                text_content += page_text + "\n"
                if page_text.strip():
                    has_text = True
            
            metadata = {
                "page_count": page_count,
                "has_extractable_text": has_text,
                "file_size": os.path.getsize(file_path),
                "creation_date": doc.metadata.get("creationDate", ""),
                "title": doc.metadata.get("title", ""),
                "author": doc.metadata.get("author", "")
            }
            
            doc.close()
            return text_content.strip(), metadata
            
        except Exception as e:
            raise DocumentError(f"Error parsing PDF: {str(e)}")
    
    @staticmethod
    def extract_docx_text(file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract text from DOCX file"""
        try:
            # Extract text using docx2txt (simpler)
            text_content = docx2txt.process(file_path)
            
            # Get additional metadata using python-docx
            doc = Document(file_path)
            word_count = len(text_content.split()) if text_content else 0
            paragraph_count = len(doc.paragraphs)
            
            # Try to get document properties
            core_props = doc.core_properties
            metadata = {
                "word_count": word_count,
                "paragraph_count": paragraph_count,
                "file_size": os.path.getsize(file_path),
                "creation_date": core_props.created.isoformat() if core_props.created else "",
                "title": core_props.title or "",
                "author": core_props.author or "",
                "last_modified": core_props.modified.isoformat() if core_props.modified else ""
            }
            
            return text_content.strip(), metadata
            
        except Exception as e:
            raise DocumentError(f"Error parsing DOCX: {str(e)}")
    
    @staticmethod
    def extract_doc_text(file_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract text from DOC file (basic support)"""
        try:
            # For older DOC files, we'll provide basic metadata
            # Note: Full DOC support would require additional libraries like python-docx2txt
            text_content = ""  # DOC parsing would need additional libraries
            
            metadata = {
                "file_size": os.path.getsize(file_path),
                "word_count": 0,
                "format": "doc",
                "note": "DOC format requires additional processing - consider converting to DOCX"
            }
            
            return text_content, metadata
            
        except Exception as e:
            raise DocumentError(f"Error parsing DOC: {str(e)}")
    
    @staticmethod
    def is_image_based_pdf(file_path: str) -> bool:
        """Check if PDF is image-based (scanned) with no extractable text"""
        try:
            doc = fitz.open(file_path)
            total_text_length = 0
            
            for page_num in range(min(3, doc.page_count)):  # Check first 3 pages
                page = doc.load_page(page_num)
                text = page.get_text().strip()
                total_text_length += len(text)
            
            doc.close()
            # If very little text found, likely image-based
            return total_text_length < 50
            
        except Exception:
            return False
    
    @staticmethod
    def parse_document(file_path: str) -> Tuple[str, Dict[str, Any], bool]:
        """
        Parse document and return text, metadata, and whether OCR is needed
        Returns: (text_content, metadata, needs_ocr)
        """
        # Validate file first
        is_valid, error_msg = DocumentParser.validate_file(file_path)
        if not is_valid:
            raise DocumentError(error_msg)
        
        extension = DocumentParser.get_file_extension(file_path)
        needs_ocr = False
        
        if extension == 'pdf':
            text_content, metadata = DocumentParser.extract_pdf_text(file_path)
            needs_ocr = DocumentParser.is_image_based_pdf(file_path)
        elif extension == 'docx':
            text_content, metadata = DocumentParser.extract_docx_text(file_path)
        elif extension == 'doc':
            text_content, metadata = DocumentParser.extract_doc_text(file_path)
        elif extension in ['jpg', 'jpeg', 'png']:
            # Image files always need OCR
            text_content = ""
            metadata = {
                "file_size": os.path.getsize(file_path),
                "format": extension,
                "is_image": True
            }
            needs_ocr = True
        else:
            raise DocumentError(f"Unsupported file format: {extension}")
        
        # Add common metadata
        metadata.update({
            "filename": os.path.basename(file_path),
            "extension": extension,
            "parsed_at": datetime.utcnow().isoformat(),
            "needs_ocr": needs_ocr
        })
        
        return text_content, metadata, needs_ocr