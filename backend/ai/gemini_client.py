"""
Google Gemini API client for document analysis and Q&A
"""

import json
import asyncio
from typing import Dict, Any
import google.generativeai as genai

from config import config
from ai.prompts import get_analysis_prompt, get_qa_prompt
from utils.errors import AIServiceError


class GeminiClient:
    """Google Gemini API client"""
    
    def __init__(self):
        """Initialize Gemini client"""
        if not config.GEMINI_API_KEY:
            raise AIServiceError("Gemini API key not configured")
        
        try:
            genai.configure(api_key=config.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        except Exception as e:
            raise AIServiceError(f"Failed to initialize Gemini client: {str(e)}")
    
    async def analyze_document(self, doc_id: str, document_text: str) -> Dict[str, Any]:
        """
        Analyze document for compliance and risk insights
        Returns structured JSON response
        """
        try:
            # Prepare the prompt
            prompt = get_analysis_prompt(document_text, doc_id)
            
            # Generate content
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None, 
                lambda: self.model.generate_content(prompt)
            )
            
            # Extract text from response
            response_text = response.text.strip()
            
            # Try to parse as JSON
            try:
                analysis_result = json.loads(response_text)
                
                # Validate the structure
                if not isinstance(analysis_result, dict):
                    raise ValueError("Response is not a valid JSON object")
                
                if "doc_id" not in analysis_result:
                    analysis_result["doc_id"] = doc_id
                
                if "insights" not in analysis_result:
                    analysis_result["insights"] = []
                
                # Validate insights structure
                for insight in analysis_result["insights"]:
                    required_fields = ["type_of_insight", "description", "intensity", "recommendation"]
                    for field in required_fields:
                        if field not in insight:
                            insight[field] = "Not specified"
                    
                    # Validate type_of_insight values
                    valid_types = ["risk", "compliance_mismatch", "suggestion"]
                    if insight["type_of_insight"] not in valid_types:
                        insight["type_of_insight"] = "suggestion"
                    
                    # Validate intensity values
                    valid_intensities = ["low", "medium", "high"]
                    if insight["intensity"] not in valid_intensities:
                        insight["intensity"] = "medium"
                
                return analysis_result
                
            except json.JSONDecodeError as e:
                # If JSON parsing fails, create a fallback response
                return {
                    "doc_id": doc_id,
                    "insights": [{
                        "type_of_insight": "suggestion",
                        "description": f"Analysis completed but response format was invalid: {str(e)}",
                        "intensity": "low",
                        "recommendation": "Review the document manually for compliance and risk assessment"
                    }],
                    "raw_response": response_text[:500]  # Include truncated raw response
                }
            
        except Exception as e:
            raise AIServiceError(f"Error analyzing document with Gemini: {str(e)}")
    
    async def answer_question(self, doc_id: str, document_text: str, question: str) -> Dict[str, Any]:
        """
        Answer a question about the document
        Returns structured response
        """
        try:
            # Prepare the prompt
            prompt = get_qa_prompt(document_text, question)
            
            # Generate content
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            # Extract answer
            answer = response.text.strip()
            
            return {
                "doc_id": doc_id,
                "query": question,
                "answer": answer
            }
            
        except Exception as e:
            raise AIServiceError(f"Error answering question with Gemini: {str(e)}")
    
    def generate_content_sync(self, prompt: str) -> str:
        """Synchronous content generation (for testing)"""
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            raise AIServiceError(f"Error generating content: {str(e)}")