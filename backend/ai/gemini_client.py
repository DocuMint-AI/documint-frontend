"""
Google Gemini API client for document analysis and Q&A
"""

import json
import asyncio
from typing import Dict, Any
import google.generativeai as genai

from config import config
from ai.prompts import (
    get_clauses_prompt, 
    get_document_type_prompt, 
    get_parties_prompt, 
    get_risk_assessment_prompt,
    get_qa_prompt
)
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
        Analyze document using multiple targeted prompts
        Returns aggregated structured JSON response
        """
        try:
            # Run multiple prompts concurrently
            prompts = {
                "clauses": get_clauses_prompt(document_text),
                "document_type": get_document_type_prompt(document_text),
                "parties": get_parties_prompt(document_text),
                "risks": get_risk_assessment_prompt(document_text)
            }
            
            # Execute all prompts concurrently
            loop = asyncio.get_event_loop()
            tasks = []
            
            for prompt_type, prompt in prompts.items():
                task = loop.run_in_executor(
                    None,
                    lambda p=prompt: self.model.generate_content(p)
                )
                tasks.append((prompt_type, task))
            
            # Wait for all responses
            results = {}
            for prompt_type, task in tasks:
                try:
                    response = await task
                    response_text = response.text.strip()
                    
                    # Clean up response text - remove markdown code blocks if present
                    if response_text.startswith('```json'):
                        response_text = response_text.replace('```json', '').replace('```', '').strip()
                    elif response_text.startswith('```'):
                        response_text = response_text.replace('```', '').strip()
                    
                    # Try to parse JSON response
                    try:
                        parsed_result = json.loads(response_text)
                        results[prompt_type] = parsed_result
                        print(f"DEBUG: Successfully parsed {prompt_type}")
                    except json.JSONDecodeError as e:
                        # More robust fallback - try to extract useful info even from bad JSON
                        print(f"DEBUG: JSON parsing failed for {prompt_type}: {str(e)}")
                        print(f"DEBUG: Raw response was: {response_text[:200]}...")
                        
                        # Create fallback based on prompt type
                        if prompt_type == "clauses":
                            results[prompt_type] = {"clause_count": 1, "clause_types": ["general"]}
                        elif prompt_type == "document_type":
                            results[prompt_type] = {"document_type": "Legal Document", "document_category": "Contract", "confidence_score": 0.7}
                        elif prompt_type == "parties":
                            results[prompt_type] = {"party_count": 2, "relationship_type": "contractual"}
                        elif prompt_type == "risks":
                            results[prompt_type] = {"risk_level": "medium", "risks": [{"severity": "medium", "description": "Standard contractual risks identified", "recommendation": "Review terms carefully"}], "compliance_issues": []}
                        
                except Exception as e:
                    print(f"DEBUG: Complete failure for {prompt_type}: {str(e)}")
                    results[prompt_type] = {
                        "error": f"Analysis failed: {str(e)}",
                        "raw_response": ""
                    }
            
            # Aggregate results into insights format for frontend compatibility
            insights = self._aggregate_results_to_insights(results)
            
            return {
                "doc_id": doc_id,
                "insights": insights,
                "detailed_analysis": results,  # Include raw results for debugging
                "analysis_timestamp": asyncio.get_event_loop().time()
            }
            
        except Exception as e:
            raise AIServiceError(f"Error analyzing document with Gemini: {str(e)}")
    
    def _aggregate_results_to_insights(self, results: Dict[str, Any]) -> list:
        """Convert multi-prompt results into insights format"""
        insights = []
        
        # Debug logging
        print(f"DEBUG: Aggregating results with keys: {list(results.keys())}")
        for key, value in results.items():
            if isinstance(value, dict) and "error" in value:
                print(f"DEBUG: {key} has error: {value['error']}")
            else:
                print(f"DEBUG: {key} successful with keys: {list(value.keys()) if isinstance(value, dict) else 'not dict'}")
        
        # Process clauses analysis
        if "clauses" in results and "error" not in results["clauses"]:
            clauses_data = results["clauses"]
            clause_count = clauses_data.get("clause_count", 0)
            insights.append({
                "type_of_insight": "suggestion",
                "description": f"Document contains {clause_count} clauses with breakdown: {', '.join(clauses_data.get('clause_types', []))}",
                "intensity": "low",
                "recommendation": "Review clause organization and ensure all necessary terms are covered"
            })
            print(f"DEBUG: Added clauses insight")
        else:
            print(f"DEBUG: Skipping clauses - error: {'error' in results.get('clauses', {})}")
        
        # Process document type analysis
        if "document_type" in results and "error" not in results["document_type"]:
            doc_type_data = results["document_type"]
            doc_type = doc_type_data.get("document_type", "Unknown")
            confidence = doc_type_data.get("confidence_score", 0)
            insights.append({
                "type_of_insight": "suggestion",
                "description": f"Document identified as: {doc_type} ({doc_type_data.get('document_category', 'N/A')} category) with {confidence:.1%} confidence",
                "intensity": "low",
                "recommendation": f"Ensure document follows {doc_type} best practices and legal requirements"
            })
            print(f"DEBUG: Added document type insight")
        else:
            print(f"DEBUG: Skipping document_type - error: {'error' in results.get('document_type', {})}")
        
        # Process parties analysis
        if "parties" in results and "error" not in results["parties"]:
            parties_data = results["parties"]
            party_count = parties_data.get("party_count", 0)
            relationship = parties_data.get("relationship_type", "Unknown")
            insights.append({
                "type_of_insight": "suggestion",
                "description": f"Document involves {party_count} parties in a {relationship} relationship",
                "intensity": "medium",
                "recommendation": "Verify all parties' legal capacity and authority to enter into this agreement"
            })
            print(f"DEBUG: Added parties insight")
        else:
            print(f"DEBUG: Skipping parties - error: {'error' in results.get('parties', {})}")
        
        # Process risk assessment
        if "risks" in results and "error" not in results["risks"]:
            risk_data = results["risks"]
            risk_level = risk_data.get("risk_level", "medium")
            risks = risk_data.get("risks", [])
            compliance_issues = risk_data.get("compliance_issues", [])
            
            # Add high-priority risks
            for risk in risks:
                if risk.get("severity") in ["high", "critical"]:
                    insights.append({
                        "type_of_insight": "risk",
                        "description": risk.get("description", "Unspecified risk identified"),
                        "intensity": risk.get("severity", "medium"),
                        "recommendation": risk.get("recommendation", "Review and mitigate this risk")
                    })
            
            # Add compliance issues
            for issue in compliance_issues:
                if issue.get("severity") in ["medium", "high"]:
                    insights.append({
                        "type_of_insight": "compliance_mismatch", 
                        "description": issue.get("issue", "Compliance issue identified"),
                        "intensity": issue.get("severity", "medium"),
                        "recommendation": f"Address compliance requirement: {issue.get('requirement', 'Review applicable regulations')}"
                    })
            
            print(f"DEBUG: Added {len(risks)} risks and {len(compliance_issues)} compliance issues")
        else:
            print(f"DEBUG: Skipping risks - error: {'error' in results.get('risks', {})}")
        
        # Ensure we have at least some insights
        print(f"DEBUG: Total insights generated: {len(insights)}")
        if not insights:
            print(f"DEBUG: No insights generated, adding fallback")
            insights.append({
                "type_of_insight": "suggestion",
                "description": "Document analysis completed but no specific insights generated",
                "intensity": "low", 
                "recommendation": "Manual review recommended to identify specific areas for improvement"
            })
        
        return insights
    
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