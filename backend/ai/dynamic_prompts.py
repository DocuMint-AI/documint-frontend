"""
Dynamic prompts for intelligent document analysis workflow
"""

# Step 1: Document Type Detection
DOCUMENT_TYPE_DETECTION_PROMPT = """
Analyze the following document and identify its type. Respond with a clear, concise answer about what type of document this is.

Document content:
{document_text}

Please identify the document type (e.g., "Non-Disclosure Agreement", "Employment Contract", "Terms of Service", "Privacy Policy", "Lease Agreement", "Purchase Agreement", etc.). 

Respond in this format:
Document Type: [TYPE]
Category: [Legal/Business/Technical/etc.]
Confidence: [High/Medium/Low]
"""

# Step 2: Generic Analysis Questions
GENERIC_ANALYSIS_QUESTIONS = [
    """
Analyze this document for potential RISK POINTS. Identify any clauses, terms, or provisions that could pose risks to either party. 

Document:
{document_text}

For each risk point you identify, specify:
- RISK: [Description of the risk]
- INTENSITY: [High/Medium/Low]
- RECOMMENDATION: [What should be done about it]
""",
    
    """
Review this document for COMPLIANCE ISSUES. Look for any provisions that might not comply with standard legal requirements, missing mandatory clauses, or regulatory concerns.

Document:
{document_text}

For each compliance issue you identify, specify:
- COMPLIANCE: [Description of the compliance issue]
- INTENSITY: [High/Medium/Low]  
- RECOMMENDATION: [How to address the compliance issue]
""",
    
    """
Provide IMPROVEMENT SUGGESTIONS for this document. Identify areas where the document could be clearer, more comprehensive, or better structured.

Document:
{document_text}

For each suggestion you provide, specify:
- SUGGESTION: [Description of the improvement]
- INTENSITY: [High/Medium/Low]
- RECOMMENDATION: [How to implement the improvement]
"""
]

# Step 3: Document-Specific Question Templates
DOCUMENT_SPECIFIC_QUESTIONS = {
    "nda": [
        "Analyze the confidentiality scope and duration in this NDA. Are the terms reasonable and enforceable?",
        "Review the exceptions and carve-outs in this NDA. Are they comprehensive enough to protect legitimate business needs?",
        "Examine the return/destruction obligations. Are they practical and clearly defined?",
        "Assess the remedies and enforcement mechanisms. Are they appropriate for confidentiality breaches?"
    ],
    
    "employment": [
        "Review the compensation and benefits structure. Are they clearly defined and fair?",
        "Analyze any non-compete or non-solicitation clauses. Are they reasonable in scope and duration?",
        "Examine the termination provisions. Are they balanced and legally compliant?",
        "Check for intellectual property assignment clauses. Are they appropriate and not overreaching?"
    ],
    
    "lease": [
        "Review the rent escalation and payment terms. Are they clearly defined and reasonable?",
        "Analyze the maintenance and repair responsibilities. Are they fairly allocated?",
        "Examine the default and termination provisions. Are they balanced for both parties?",
        "Check for insurance and liability requirements. Are they appropriate and not excessive?"
    ],
    
    "purchase": [
        "Review the payment terms and conditions. Are they clear and protect both parties?",
        "Analyze the delivery and acceptance criteria. Are they specific and measurable?",
        "Examine warranty and liability provisions. Are they appropriate for the goods/services?",
        "Check the dispute resolution mechanisms. Are they efficient and fair?"
    ],
    
    "service": [
        "Review the scope of work and deliverables. Are they clearly defined and measurable?",
        "Analyze the performance standards and SLAs. Are they realistic and enforceable?",
        "Examine the payment terms and milestone structure. Are they fair and practical?",
        "Check for intellectual property and confidentiality provisions. Are they appropriate?"
    ],
    
    "terms": [
        "Review the user rights and restrictions. Are they clearly communicated and reasonable?",
        "Analyze the liability limitations and disclaimers. Are they legally compliant?",
        "Examine the privacy and data collection practices. Are they transparent and compliant?",
        "Check the modification and termination procedures. Are they fair to users?"
    ],
    
    "privacy": [
        "Review the data collection and usage descriptions. Are they comprehensive and clear?",
        "Analyze the user consent mechanisms. Are they compliant with privacy regulations?",
        "Examine the data sharing and third-party provisions. Are they transparent and limited?",
        "Check the user rights and control mechanisms. Are they adequate and accessible?"
    ]
}

def get_document_type_prompt(document_text: str) -> str:
    """Get prompt for document type detection"""
    return DOCUMENT_TYPE_DETECTION_PROMPT.format(document_text=document_text)

def get_generic_analysis_prompts(document_text: str) -> list:
    """Get all generic analysis prompts"""
    return [prompt.format(document_text=document_text) for prompt in GENERIC_ANALYSIS_QUESTIONS]

def get_document_specific_prompts(document_type: str, document_text: str) -> list:
    """Get document-specific prompts based on detected type"""
    # Map document types to question sets
    type_mapping = {
        "non-disclosure": "nda",
        "nda": "nda", 
        "confidentiality": "nda",
        "employment": "employment",
        "job": "employment",
        "work": "employment",
        "lease": "lease",
        "rental": "lease",
        "rent": "lease",
        "purchase": "purchase",
        "buy": "purchase",
        "sale": "purchase",
        "service": "service",
        "consulting": "service",
        "professional": "service",
        "terms": "terms",
        "tos": "terms",
        "conditions": "terms",
        "privacy": "privacy",
        "data": "privacy"
    }
    
    # Find matching question set
    doc_type_lower = document_type.lower()
    question_key = None
    
    for key_phrase, question_set in type_mapping.items():
        if key_phrase in doc_type_lower:
            question_key = question_set
            break
    
    # Default to service agreement questions if no match
    if not question_key:
        question_key = "service"
    
    questions = DOCUMENT_SPECIFIC_QUESTIONS.get(question_key, DOCUMENT_SPECIFIC_QUESTIONS["service"])
    
    # Format questions with document text
    formatted_questions = []
    for question in questions:
        formatted_question = f"""
{question}

Document:
{document_text}

Please provide your analysis with specific references to the document clauses. Format your response as:
- ANALYSIS: [Your detailed analysis]
- INTENSITY: [High/Medium/Low]
- RECOMMENDATION: [Specific actionable recommendation]
"""
        formatted_questions.append(formatted_question)
    
    return formatted_questions

def get_qa_prompt(document_text: str, question: str) -> str:
    """Get formatted Q&A prompt (unchanged)"""
    return f"""
You are an AI assistant that answers questions about documents accurately and concisely.

Based on the provided document, answer the user's question. If the information is not available in the document, clearly state that.

Document content:
{document_text}

Question: {question}

Provide a clear, accurate answer based only on the information in the document. If the answer cannot be found in the document, say "The information to answer this question is not available in the provided document."
"""