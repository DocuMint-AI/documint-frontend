"""
Google Cloud Vision API integration for OCR processing
"""

import os
import logging
from typing import Tuple, Dict, Any, Optional
from google.cloud import vision
import fitz  # PyMuPDF for PDF page extraction
from PIL import Image
import io

from utils.errors import AIServiceError
from config import config

# Set up logging
logger = logging.getLogger(__name__)


class VisionOCR:
    """Google Cloud Vision API client for OCR"""
    
    def __init__(self):
        """Initialize Vision API client"""
        try:
            logger.info("Initializing Google Cloud Vision API client")
            self.client = vision.ImageAnnotatorClient()
            logger.info("Vision API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Vision API client: {str(e)}", exc_info=True)
            raise AIServiceError(f"Failed to initialize Vision API client: {str(e)}", "VISION_INIT_ERROR")
    
    def extract_text_from_image(self, image_path: str) -> Tuple[str, Dict[str, Any]]:
        """Extract text from an image file"""
        try:
            logger.info(f"Starting OCR processing for image: {image_path}")
            with open(image_path, 'rb') as image_file:
                content = image_file.read()
            
            logger.info(f"Image file loaded, size: {len(content)} bytes")
            image = vision.Image(content=content)
            response = self.client.text_detection(image=image)
            
            if response.error.message:
                logger.error(f"Vision API error for {image_path}: {response.error.message}")
                raise AIServiceError(f"Vision API error: {response.error.message}", "VISION_API_ERROR")
            
            texts = response.text_annotations
            
            if not texts:
                logger.warning(f"No text detected in image: {image_path}")
                return "", {"confidence": 0, "bounding_boxes": []}
            
            # First text annotation contains the entire detected text
            full_text = texts[0].description
            logger.info(f"OCR completed for {image_path}. Extracted {len(full_text)} characters")
            
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
            
            logger.info(f"OCR data compiled for {image_path}. Confidence: {ocr_data['confidence']:.2f}, Text blocks: {ocr_data['total_text_blocks']}")
            return full_text, ocr_data
            
        except Exception as e:
            logger.error(f"Error processing image {image_path} with Vision API: {str(e)}", exc_info=True)
            raise AIServiceError(f"Error processing image with Vision API: {str(e)}", "VISION_PROCESSING_ERROR")
    
    def extract_text_from_pdf_page(self, pdf_path: str, page_num: int) -> Tuple[str, Dict[str, Any]]:
        """Extract text from a specific PDF page using OCR"""
        try:
            logger.info(f"Starting OCR for PDF page {page_num} in {pdf_path}")
            # Open PDF and get the page as an image
            doc = fitz.open(pdf_path)
            page = doc.load_page(page_num)
            
            # Convert page to image
            mat = fitz.Matrix(2.0, 2.0)  # Zoom factor for better OCR
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            doc.close()
            logger.info(f"PDF page {page_num} converted to image, size: {len(img_data)} bytes")
            
            # Process with Vision API
            image = vision.Image(content=img_data)
            response = self.client.text_detection(image=image)
            
            if response.error.message:
                logger.error(f"Vision API error for PDF page {page_num}: {response.error.message}")
                raise AIServiceError(f"Vision API error: {response.error.message}", "VISION_API_ERROR")
            
            texts = response.text_annotations
            
            if not texts:
                logger.warning(f"No text detected in PDF page {page_num}")
                return "", {"page": page_num, "confidence": 0}
            
            full_text = texts[0].description
            confidence = getattr(texts[0], 'confidence', 0)
            logger.info(f"OCR completed for PDF page {page_num}. Extracted {len(full_text)} characters, confidence: {confidence:.2f}")
            
            ocr_data = {
                "page": page_num,
                "confidence": confidence,
                "text_blocks": len(texts) - 1
            }
            
            return full_text, ocr_data
            
        except Exception as e:
            logger.error(f"Error processing PDF page {page_num}: {str(e)}", exc_info=True)
            raise AIServiceError(f"Error processing PDF page {page_num}: {str(e)}", "VISION_PDF_ERROR")
    
    def extract_text(self, file_path: str) -> Tuple[str, Dict[str, Any]]:
        """
        Extract text from file (image or PDF) using OCR
        Returns: (extracted_text, ocr_data)
        """
        if not os.path.exists(file_path):
            logger.error(f"File not found for OCR: {file_path}")
            raise AIServiceError(f"File not found: {file_path}", "FILE_NOT_FOUND")
        
        file_extension = file_path.lower().split('.')[-1]
        logger.info(f"Starting OCR extraction for file: {file_path}, type: {file_extension}")
        
        if file_extension in ['jpg', 'jpeg', 'png']:
            return self.extract_text_from_image(file_path)
        
        elif file_extension == 'pdf':
            # Process all pages of the PDF
            try:
                logger.info(f"Processing PDF file for OCR: {file_path}")
                doc = fitz.open(file_path)
                total_pages = doc.page_count
                logger.info(f"PDF has {total_pages} pages")
                all_text = ""
                all_ocr_data = {
                    "pages": [],
                    "total_pages": total_pages,
                    "avg_confidence": 0
                }
                
                total_confidence = 0
                pages_processed = 0
                
                for page_num in range(doc.page_count):
                    logger.info(f"Processing PDF page {page_num + 1}/{total_pages}")
                    page_text, page_data = self.extract_text_from_pdf_page(file_path, page_num)
                    
                    if page_text.strip():
                        all_text += f"\n--- Page {page_num + 1} ---\n"
                        all_text += page_text
                        all_ocr_data["pages"].append(page_data)
                        total_confidence += page_data.get("confidence", 0)
                        pages_processed += 1
                    else:
                        logger.warning(f"No text extracted from PDF page {page_num + 1}")
                
                doc.close()
                
                if pages_processed > 0:
                    all_ocr_data["avg_confidence"] = total_confidence / pages_processed
                    logger.info(f"PDF OCR completed. Total pages processed: {pages_processed}/{total_pages}, avg confidence: {all_ocr_data['avg_confidence']:.2f}")
                else:
                    logger.warning(f"No text was extracted from any pages in PDF: {file_path}")
                
                return all_text.strip(), all_ocr_data
                
            except Exception as e:
                logger.error(f"Error processing PDF {file_path} with OCR: {str(e)}", exc_info=True)
                raise AIServiceError(f"Error processing PDF with OCR: {str(e)}", "VISION_PDF_PROCESSING_ERROR")
        
        else:
            logger.error(f"Unsupported file type for OCR: {file_extension}")
            raise AIServiceError(f"Unsupported file type for OCR: {file_extension}", "UNSUPPORTED_FILE_TYPE")