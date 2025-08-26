from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import aiofiles
import os
import asyncio
from typing import Optional
import httpx
import PyPDF2
import docx
import io
import re
from datetime import datetime

app = FastAPI(title="DocuMint API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo (use database in production)
documents = {}

class ChatRequest(BaseModel):
    message: str
    document_text: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: str

class DocumentInsights(BaseModel):
    risks: list[str]
    timelines: list[str]
    obligations: list[str]
    summary: str

# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
MODEL_NAME = "doomgrave/gemma3-tools:12b-it-q2_K"

async def call_ollama(prompt: str, max_tokens: int = 1000) -> str:
    """Call Ollama API with the given prompt"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "max_tokens": max_tokens,
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("response", "").strip()
            else:
                raise HTTPException(status_code=500, detail="Ollama API error")
                
    except Exception as e:
        print(f"Ollama error: {e}")
        return "I apologize, but I'm currently unable to process your request. Please try again later."

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {str(e)}")

async def generate_insights(text: str) -> DocumentInsights:
    """Generate document insights using Ollama"""
    
    # Prompt for extracting insights
    insights_prompt = f"""
You are a legal document analysis expert. Analyze the following document and extract key information in a structured format.

Document text:
{text[:3000]}...

Please provide a JSON-like response with the following structure:

RISKS:
- List 3-5 key legal or business risks mentioned in the document
- Focus on liability, penalties, breach conditions, termination risks

TIMELINES:
- List 3-5 important dates, deadlines, or time periods
- Include specific dates, durations, notice periods

OBLIGATIONS:
- List 3-5 key obligations or responsibilities for each party
- Focus on deliverables, payments, compliance requirements

SUMMARY:
- Provide a 2-3 sentence summary of the document's main purpose and key terms

Format your response clearly with each section. Be concise and specific.
"""

    response = await call_ollama(insights_prompt, max_tokens=800)
    
    # Parse the response to extract structured data
    risks = []
    timelines = []
    obligations = []
    summary = ""
    
    lines = response.split('\n')
    current_section = None
    
    for line in lines:
        line = line.strip()
        if 'RISKS:' in line.upper():
            current_section = 'risks'
        elif 'TIMELINES:' in line.upper():
            current_section = 'timelines'
        elif 'OBLIGATIONS:' in line.upper():
            current_section = 'obligations'
        elif 'SUMMARY:' in line.upper():
            current_section = 'summary'
        elif line.startswith('-') and current_section:
            item = line[1:].strip()
            if current_section == 'risks':
                risks.append(item)
            elif current_section == 'timelines':
                timelines.append(item)
            elif current_section == 'obligations':
                obligations.append(item)
        elif current_section == 'summary' and line:
            summary += line + " "
    
    # Fallback if parsing fails
    if not risks and not timelines and not obligations:
        risks = ["Risk analysis unavailable"]
        timelines = ["Timeline analysis unavailable"]
        obligations = ["Obligations analysis unavailable"]
        summary = "Document analysis completed. Please use the chat for specific questions."
    
    return DocumentInsights(
        risks=risks[:5],
        timelines=timelines[:5],
        obligations=obligations[:5],
        summary=summary.strip() or "Document uploaded and analyzed successfully."
    )

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document"""
    
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    
    try:
        # Read file content
        content = await file.read()
        
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(content)
        else:
            text = extract_text_from_docx(content)
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text content found in document")
        
        # Generate document ID
        doc_id = f"doc_{int(datetime.now().timestamp())}"
        
        # Store document
        documents[doc_id] = {
            "id": doc_id,
            "filename": file.filename,
            "text": text,
            "uploaded_at": datetime.now().isoformat()
        }
        
        return {
            "text": text,
            "filename": file.filename,
            "document_id": doc_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_with_document(request: ChatRequest):
    """Chat with the AI assistant about the document"""
    
    # Use provided document context
    document_context = ""
    if request.document_text:
        document_context = f"\n\nDocument context:\n{request.document_text[:2000]}..."
    
    # Create chat prompt
    chat_prompt = f"""You are a helpful legal document assistant. Provide clear, concise answers about legal documents. Always recommend consulting with a qualified lawyer for important decisions.

Use proper markdown formatting in your responses:
- Use **bold** for important terms
- Use *italics* for emphasis
- Use bullet points for lists
- Use `code blocks` for specific clauses or references
- Use proper headings when organizing longer responses

User question: {request.message}{document_context}

Provide a helpful, well-formatted markdown response:"""

    response_text = await call_ollama(chat_prompt, max_tokens=600)
    
    return ChatResponse(
        response=response_text,
        timestamp=datetime.now().isoformat()
    )

@app.get("/document/{doc_id}")
async def get_document(doc_id: str):
    """Get document details"""
    if doc_id not in documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return documents[doc_id]

@app.post("/insights")
async def generate_insights(request: dict):
    """Generate insights from document text"""
    document_text = request.get("document_text", "")
    
    if not document_text:
        raise HTTPException(status_code=400, detail="Document text is required")
    
    # Create insights prompt
    insights_prompt = f"""Analyze the following legal document and provide insights in the requested categories. Format your response in markdown.

Document text:
{document_text[:3000]}...

Please provide analysis in these categories:

## Summary
Provide a concise summary of the document's main purpose and key points.

## Risks
Identify potential risks, liabilities, and concerning clauses.

## Obligations
List the key obligations and responsibilities for each party.

## Timelines
Extract any important dates, deadlines, or time-sensitive requirements.

Format each section with clear markdown headers and bullet points where appropriate."""

    response_text = await call_ollama(insights_prompt, max_tokens=1000)
    
    # Parse the response into categories (simple approach)
    sections = response_text.split("## ")
    insights = {
        "summary": "",
        "risks": "",
        "obligations": "",
        "timelines": ""
    }
    
    for section in sections[1:]:  # Skip first empty split
        if section.lower().startswith("summary"):
            insights["summary"] = "## " + section.strip()
        elif section.lower().startswith("risks"):
            insights["risks"] = "## " + section.strip()
        elif section.lower().startswith("obligations"):
            insights["obligations"] = "## " + section.strip()
        elif section.lower().startswith("timelines"):
            insights["timelines"] = "## " + section.strip()
    
    return {"insights": insights}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)