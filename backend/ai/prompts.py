"""
Prompt templates for Gemini API interactions
"""

DOCUMENT_ANALYSIS_PROMPT = """
You are an AI compliance and risk analysis assistant.
Analyze the provided document and return only valid JSON in the following format:
{{
  "doc_id": "<string>",
  "insights": [
    {{
      "type_of_insight": "risk | compliance_mismatch | suggestion",
      "description": "<string>",
      "intensity": "low | medium | high",
      "recommendation": "<string>"
    }}
  ]
}}

Each insight must include:
- type_of_insight: one of "risk", "compliance_mismatch", or "suggestion"  
- description: human-readable explanation of the insight
- intensity: one of "low", "medium", or "high"
- recommendation: actionable recommendation (required)

Focus on:
- Legal and regulatory compliance issues
- Financial risks and liabilities
- Contractual obligations and penalties
- Missing or unclear terms
- Recommendations for improvement

Document to analyze:
{document_text}

Return only the JSON response, no additional text or formatting.
"""

QA_PROMPT = """
You are an AI assistant that answers questions about documents accurately and concisely.

Based on the provided document, answer the user's question. If the information is not available in the document, clearly state that.

Document content:
{document_text}

Question: {question}

Provide a clear, accurate answer based only on the information in the document. If the answer cannot be found in the document, say "The information to answer this question is not available in the provided document."
"""

def get_analysis_prompt(document_text: str, doc_id: str) -> str:
    """Get formatted analysis prompt"""
    return DOCUMENT_ANALYSIS_PROMPT.format(document_text=document_text)

def get_qa_prompt(document_text: str, question: str) -> str:
    """Get formatted Q&A prompt"""
    return QA_PROMPT.format(document_text=document_text, question=question)