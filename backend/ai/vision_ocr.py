"""
Google Cloud Vision API integration for OCR processing
"""

import os
from typing import Tuple, Dict, Any, Optional
from google.cloud import vision
import fitz  # PyMuPDF for PDF page extraction
from PIL import Image
import io

from utils.errors import AIServiceError
from config import config


class VisionOCR:
    """Google Cloud Vision API client for OCR"""
    
    def __init__(self):
        """Initialize Vision API client"""
        try:
            self.client = vision.ImageAnnotatorClient()
        except Exception as e:
            raise AIServiceError(f"Failed to initialize Vision API client: {str(e)}")
    
    def extract_text_from_image(self, image_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract text from an image file"""
        try:
            with open(image_path, 'rb') as image_file:
                content = image_file.read()
            
            image = vision.Image(content=content)
            response = self.client.text_detection(image=image)
            
            if response.error.message:
                raise AIServiceError(f"Vision API error: {response.error.message}")
            
            texts = response.text_annotations
            
            if not texts:
                return "", {"confidence": 0, "bounding_boxes": []}
            
            # First text annotation contains the entire detected text
            full_text = texts[0].description
            
            # Extract bounding box information
            bounding_boxes = []
            for text in texts[1:]:  # Skip the first one as it's the full text
                vertices = [(vertex.x, vertex.y) for vertex in text.bounding_poly.vertices]
                bounding_boxes.append({
                    "text": text.description,
                    "vertices": vertices,
                    "confidence": getattr(text, 'confidence', 0)
                })
            
            ocr_data = {
                "confidence": getattr(texts[0], 'confidence', 0),
                "bounding_boxes": bounding_boxes,
                "total_text_blocks": len(texts) - 1
            }
            
            return full_text, ocr_data
            
        except Exception as e:
            raise AIServiceError(f"Error processing image with Vision API: {str(e)}")
    
    def extract_text_from_pdf_page(self, pdf_path: str, page_num: int) -> Tuple[str, Dict[str, Any]]:
        """Extract text from a specific PDF page using OCR"""
        try:
            # Open PDF and get the page as an image
            doc = fitz.open(pdf_path)
            page = doc.load_page(page_num)
            
            # Convert page to image
            mat = fitz.Matrix(2.0, 2.0)  # Zoom factor for better OCR
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            doc.close()
            
            # Process with Vision API
            image = vision.Image(content=img_data)
            response = self.client.text_detection(image=image)
            
            if response.error.message:
                raise AIServiceError(f"Vision API error: {response.error.message}")
            
            texts = response.text_annotations
            
            if not texts:
                return "", {"page": page_num, "confidence": 0}
            
            full_text = texts[0].description
            
            ocr_data = {
                "page": page_num,
                "confidence": getattr(texts[0], 'confidence', 0),
                "text_blocks": len(texts) - 1
            }
            
            return full_text, ocr_data
            
        except Exception as e:
            raise AIServiceError(f"Error processing PDF page {page_num}: {str(e)}")
    
    def extract_text(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """
        Extract text from file (image or PDF) using OCR
        Returns: (extracted_text, ocr_data)
        """
        if not os.path.exists(file_path):
            raise AIServiceError(f"File not found: {file_path}")
        
        file_extension = file_path.lower().split('.')[-1]
        
        if file_extension in ['jpg', 'jpeg', 'png']:
            return self.extract_text_from_image(file_path)
        
        elif file_extension == 'pdf':
            # Process all pages of the PDF
            try:
                doc = fitz.open(file_path)
                all_text = ""
                all_ocr_data = {
                    "pages": [],
                    "total_pages": doc.page_count,
                    "avg_confidence": 0
                }
                
                total_confidence = 0
                pages_processed = 0
                
                for page_num in range(doc.page_count):
                    page_text, page_data = self.extract_text_from_pdf_page(file_path, page_num)
                    
                    if page_text.strip():
                        all_text += f"\n--- Page {page_num + 1} ---\n"
                        all_text += page_text
                        all_ocr_data["pages"].append(page_data)
                        total_confidence += page_data.get("confidence", 0)
                        pages_processed += 1
                
                doc.close()
                
                if pages_processed > 0:
                    all_ocr_data["avg_confidence"] = total_confidence / pages_processed
                
                return all_text.strip(), all_ocr_data
                
            except Exception as e:
                raise AIServiceError(f"Error processing PDF with OCR: {str(e)}")
        
        else:
            raise AIServiceError(f"Unsupported file type for OCR: {file_extension}")