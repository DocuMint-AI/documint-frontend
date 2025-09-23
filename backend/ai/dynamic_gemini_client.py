"""
Enhanced Gemini client with dynamic document analysis workflow
"""

import asyncio
from typing import Dict, Any, List
import google.generativeai as genai

from config import config
from ai.dynamic_prompts import (
    get_document_type_prompt,
    get_generic_analysis_prompts,
    get_document_specific_prompts,
    get_qa_prompt
)
from ai.text_parser import InsightTextParser, ParsedInsight
from utils.errors import AIServiceError


class DynamicGeminiClient:
    """Enhanced Gemini client with intelligent document analysis workflow"""
    
    def __init__(self):
        """Initialize Gemini client"""
        if not config.GEMINI_API_KEY:
            raise AIServiceError("Gemini API key not configured", "GEMINI_API_KEY_MISSING")
        
        try:
            genai.configure(api_key=config.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.parser = InsightTextParser()
        except Exception as e:
            raise AIServiceError(f"Failed to initialize Gemini client: {str(e)}", "GEMINI_INIT_ERROR")

    async def analyze_document_dynamic(self, doc_id: str, document_text: str) -> Dict[str, Any]:
        """
        Comprehensive document analysis using dynamic workflow:
        1. Detect document type
        2. Ask generic questions
        3. Ask document-specific questions
        4. Parse and structure responses
        """
        try:
            print(f"DEBUG: Starting dynamic analysis for document {doc_id}")
            
            # Step 1: Detect document type
            doc_type_info = await self._detect_document_type(document_text)
            print(f"DEBUG: Detected document type: {doc_type_info}")
            
            # Step 2: Run generic analysis
            generic_insights = await self._run_generic_analysis(document_text)
            print(f"DEBUG: Generated {len(generic_insights)} generic insights")
            
            # Step 3: Run document-specific analysis
            specific_insights = await self._run_specific_analysis(
                doc_type_info['document_type'], document_text
            )
            print(f"DEBUG: Generated {len(specific_insights)} specific insights")
            
            # Step 4: Combine and format results
            all_insights = generic_insights + specific_insights
            
            # Convert ParsedInsight objects to the expected format
            formatted_insights = []
            for insight in all_insights:
                formatted_insights.append({
                    "type_of_insight": insight.type,
                    "description": insight.description,
                    "intensity": insight.intensity.lower(),
                    "recommendation": insight.recommendation
                })
            
            # Ensure we have insights
            if not formatted_insights:
                formatted_insights.append({
                    "type_of_insight": "suggestion",
                    "description": "Document analysis completed successfully using dynamic workflow",
                    "intensity": "low",
                    "recommendation": "Review the document for any specific requirements in your use case"
                })
            
            analysis_result = {
                "doc_id": doc_id,
                "insights": formatted_insights,
                "document_analysis": {
                    "document_type": doc_type_info,
                    "total_insights": len(formatted_insights),
                    "generic_insights_count": len(generic_insights),
                    "specific_insights_count": len(specific_insights)
                },
                "analysis_method": "dynamic_workflow"
            }
            
            print(f"DEBUG: Final analysis contains {len(formatted_insights)} total insights")
            return analysis_result
            
        except Exception as e:
            print(f"DEBUG: Dynamic analysis failed: {str(e)}")
            raise AIServiceError(f"Error in dynamic document analysis: {str(e)}", "GEMINI_ANALYSIS_ERROR")

    async def _detect_document_type(self, document_text: str) -> Dict[str, str]:
        """Step 1: Detect document type"""
        try:
            prompt = get_document_type_prompt(document_text)
            
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            
            response_text = response.text.strip()
            print(f"DEBUG: Document type detection response: {response_text[:200]}...")
            
            return self.parser.parse_document_type(response_text)
            
        except Exception as e:
            print(f"DEBUG: Document type detection failed: {str(e)}")
            return {
                'document_type': 'Legal Document',
                'category': 'Legal',
                'confidence': 'Low'
            }

    async def _run_generic_analysis(self, document_text: str) -> List[ParsedInsight]:
        """Step 2: Run generic analysis questions"""
        insights = []
        
        try:
            generic_prompts = get_generic_analysis_prompts(document_text)
            print(f"DEBUG: Running {len(generic_prompts)} generic analysis prompts")
            
            # Run prompts concurrently
            loop = asyncio.get_event_loop()
            tasks = []
            
            for i, prompt in enumerate(generic_prompts):
                task = loop.run_in_executor(
                    None,
                    lambda p=prompt: self.model.generate_content(p)
                )
                tasks.append((i, task))
            
            # Process responses
            for i, task in tasks:
                try:
                    response = await task
                    response_text = response.text.strip()
                    print(f"DEBUG: Generic prompt {i} response length: {len(response_text)}")
                    
                    # Determine default type based on prompt index
                    default_types = ['risk', 'compliance', 'suggestion']
                    default_type = default_types[i] if i < len(default_types) else 'suggestion'
                    
                    prompt_insights = self.parser.parse_insights_from_text(response_text, default_type)
                    insights.extend(prompt_insights)
                    print(f"DEBUG: Extracted {len(prompt_insights)} insights from generic prompt {i}")
                    
                except Exception as e:
                    print(f"DEBUG: Generic prompt {i} failed: {str(e)}")
                    continue
            
            return insights
            
        except Exception as e:
            print(f"DEBUG: Generic analysis failed: {str(e)}")
            return []

    async def _run_specific_analysis(self, document_type: str, document_text: str) -> List[ParsedInsight]:
        """Step 3: Run document-specific analysis"""
        insights = []
        
        try:
            specific_prompts = get_document_specific_prompts(document_type, document_text)
            print(f"DEBUG: Running {len(specific_prompts)} document-specific prompts for type: {document_type}")
            
            # Run prompts concurrently (limit to 3 for performance)
            loop = asyncio.get_event_loop()
            tasks = []
            
            for i, prompt in enumerate(specific_prompts[:3]):  # Limit to 3 specific questions
                task = loop.run_in_executor(
                    None,
                    lambda p=prompt: self.model.generate_content(p)
                )
                tasks.append((i, task))
            
            # Process responses
            for i, task in tasks:
                try:
                    response = await task
                    response_text = response.text.strip()
                    print(f"DEBUG: Specific prompt {i} response length: {len(response_text)}")
                    
                    prompt_insights = self.parser.parse_insights_from_text(response_text, 'analysis')
                    insights.extend(prompt_insights)
                    print(f"DEBUG: Extracted {len(prompt_insights)} insights from specific prompt {i}")
                    
                except Exception as e:
                    print(f"DEBUG: Specific prompt {i} failed: {str(e)}")
                    continue
            
            return insights
            
        except Exception as e:
            print(f"DEBUG: Specific analysis failed: {str(e)}")
            return []

    async def answer_question(self, doc_id: str, document_text: str, question: str) -> Dict[str, Any]:
        """
        Answer a question about the document (unchanged)
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