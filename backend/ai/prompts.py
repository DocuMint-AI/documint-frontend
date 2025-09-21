"""
Prompt templates for Gemini API interactions
"""

# Multiple targeted prompts for detailed analysis
CLAUSES_COUNT_PROMPT = """
You are an AI legal document analyzer. Analyze the provided document and count the number of clauses/sections.

Return only valid JSON in this format:
{{
  "clause_count": <number>,
  "clause_types": ["<type1>", "<type2>", ...],
  "detailed_breakdown": {{
    "<clause_type>": <count>,
    ...
  }}
}}

Document to analyze:
{document_text}

Return only the JSON response, no additional text.
"""

DOCUMENT_TYPE_PROMPT = """
You are an AI legal document classifier. Identify the type and category of the provided document.

Return only valid JSON in this format:
{{
  "document_type": "<primary_type>",
  "document_category": "<category>",
  "legal_domain": "<domain>",
  "formality_level": "formal | semi-formal | informal",
  "confidence_score": <0.0-1.0>
}}

Document to analyze:
{document_text}

Return only the JSON response, no additional text.
"""

PARTIES_ANALYSIS_PROMPT = """
You are an AI legal document analyzer. Identify and analyze the parties involved in this document.

Return only valid JSON in this format:
{{
  "party_count": <number>,
  "parties": [
    {{
      "name": "<party_name>",
      "role": "<role_in_document>",
      "entity_type": "individual | corporation | organization | government"
    }}
  ],
  "relationship_type": "<type_of_relationship>"
}}

Document to analyze:
{document_text}

Return only the JSON response, no additional text.
"""

RISK_ASSESSMENT_PROMPT = """
You are an AI risk assessment specialist. Identify potential risks, liabilities, and compliance issues in this document.

Return only valid JSON in this format:
{{
  "risk_level": "low | medium | high",
  "risks": [
    {{
      "type": "financial | legal | operational | compliance",
      "description": "<risk_description>",
      "severity": "low | medium | high | critical",
      "recommendation": "<mitigation_recommendation>"
    }}
  ],
  "compliance_issues": [
    {{
      "issue": "<compliance_issue>",
      "severity": "low | medium | high",
      "requirement": "<regulatory_requirement>"
    }}
  ]
}}

Document to analyze:
{document_text}

Return only the JSON response, no additional text.
"""

QA_PROMPT = """
You are an AI assistant that answers questions about documents accurately and concisely.

Based on the provided document, answer the user's question. If the information is not available in the document, clearly state that.

Document content:
{document_text}

Question: {question}

Provide a clear, accurate answer based only on the information in the document. If the answer cannot be found in the document, say "The information to answer this question is not available in the provided document."
"""

def get_clauses_prompt(document_text: str) -> str:
    """Get formatted clauses analysis prompt"""
    return CLAUSES_COUNT_PROMPT.format(document_text=document_text)

def get_document_type_prompt(document_text: str) -> str:
    """Get formatted document type prompt"""
    return DOCUMENT_TYPE_PROMPT.format(document_text=document_text)

def get_parties_prompt(document_text: str) -> str:
    """Get formatted parties analysis prompt"""
    return PARTIES_ANALYSIS_PROMPT.format(document_text=document_text)

def get_risk_assessment_prompt(document_text: str) -> str:
    """Get formatted risk assessment prompt"""
    return RISK_ASSESSMENT_PROMPT.format(document_text=document_text)

def get_qa_prompt(document_text: str, question: str) -> str:
    """Get formatted Q&A prompt"""
    return QA_PROMPT.format(document_text=document_text, question=question)