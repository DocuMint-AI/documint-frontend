// API configuration and utilities for DocuMint AI
import { extractDocumentText, generateMockAnalysis, ExtractedDocument } from './documentExtractor';

// Environment configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000',
  endpoints: {
    upload: process.env.NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT || '/upload',
    processDocument: process.env.NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT || '/api/v1/process-document',
    qa: process.env.NEXT_PUBLIC_BACKEND_QA_ENDPOINT || '/api/v1/qa',
  },
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB default
  supportedFormats: process.env.NEXT_PUBLIC_SUPPORTED_FORMATS?.split(',') || ['.pdf', '.doc', '.docx'],
};

export interface UploadResponse {
  success: boolean;
  documentId: string;
  filename: string;
  extractedDoc?: ExtractedDocument;
  message?: string;
  error?: string;
}

export interface ProcessDocumentResponse {
  success: boolean;
  documentId: string;
  analysis: {
    insights: Array<{
      type: string;
      level: string;
      text: string;
      color: string;
    }>;
    summary: string;
    riskScore: number;
    complianceScore: number;
    extractedText?: string;
  };
  error?: string;
}

export interface QAResponse {
  success: boolean;
  answer: string;
  confidence: number;
  sources?: string[];
  error?: string;
}

// API health check function
async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('API health check failed, falling back to mock mode:', error);
    return false;
  }
}

// Automatically determine API mode based on backend availability
export const getApiMode = async (): Promise<'mock' | 'real'> => {
  if (typeof window === 'undefined') return 'mock';
  
  // Check localStorage for manual override
  const manualMode = localStorage.getItem('apiMode') as 'mock' | 'real' | null;
  if (manualMode === 'mock') return 'mock'; // Respect manual mock mode
  
  // Check if API is available
  const isApiHealthy = await checkApiHealth();
  const mode = isApiHealthy ? 'real' : 'mock';
  
  // Cache the result for this session
  localStorage.setItem('detectedApiMode', mode);
  
  return mode;
};

export const setApiMode = (mode: 'mock' | 'real') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiMode', mode);
  }
};

// Mock API delay for realistic simulation
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
const generateMockInsights = () => [
  { type: 'Risk', level: 'High', text: 'Overly broad confidentiality scope may be unenforceable', color: 'red' },
  { type: 'Compliance', level: 'Medium', text: 'Missing jurisdiction clause for dispute resolution', color: 'yellow' },
  { type: 'Standard', level: 'Low', text: 'Term length aligns with industry standards', color: 'green' },
  { type: 'Suggestion', level: 'Medium', text: 'Consider adding mutual confidentiality provisions', color: 'yellow' },
  { type: 'Legal', level: 'Medium', text: 'Definition of confidential information could be more specific', color: 'yellow' },
  { type: 'Risk', level: 'High', text: 'No carve-outs for publicly available information', color: 'red' },
  { type: 'Compliance', level: 'Low', text: 'Return/destruction clause is properly defined', color: 'green' },
];

// Upload file API
export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const apiMode = await getApiMode();
  
  if (apiMode === 'mock') {
    await mockDelay(2000);
    
    // Simulate file validation
    const supportedExtensions = API_CONFIG.supportedFormats.map(format => format.replace('.', ''));
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !supportedExtensions.includes(fileExtension)) {
      return {
        success: false,
        documentId: '',
        filename: file.name,
        error: `Only ${API_CONFIG.supportedFormats.join(', ')} files are supported`
      };
    }
    
    if (file.size > API_CONFIG.maxFileSize) {
      const maxSizeMB = API_CONFIG.maxFileSize / (1024 * 1024);
      return {
        success: false,
        documentId: '',
        filename: file.name,
        error: `File size must be less than ${maxSizeMB}MB`
      };
    }
    
    // Extract text from the document in mock mode
    try {
      const extractedDoc = await extractDocumentText(file);
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store extracted document for later use
      if (typeof window !== 'undefined') {
        localStorage.setItem(`document_${documentId}`, JSON.stringify(extractedDoc));
      }
      
      return {
        success: true,
        documentId,
        filename: file.name,
        extractedDoc,
        message: 'Document uploaded and text extracted successfully'
      };
    } catch (error) {
      return {
        success: false,
        documentId: '',
        filename: file.name,
        error: error instanceof Error ? error.message : 'Failed to extract document text'
      };
    }
  } else {
    // Real API call
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.upload}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Real API upload failed, falling back to mock mode:', error);
      // Fallback to mock mode if real API fails
      localStorage.setItem('apiMode', 'mock');
      return uploadDocument(file);
    }
  }
};

// Process document API
export const processDocument = async (documentId: string): Promise<ProcessDocumentResponse> => {
  const apiMode = await getApiMode();
  
  if (apiMode === 'mock') {
    await mockDelay(3000);
    
    // Get extracted document from localStorage
    const storedDoc = typeof window !== 'undefined' ? 
      localStorage.getItem(`document_${documentId}`) : null;
    
    if (storedDoc) {
      const extractedDoc = JSON.parse(storedDoc) as ExtractedDocument;
      const analysis = generateMockAnalysis(extractedDoc);
      
      return {
        success: true,
        documentId,
        analysis
      };
    } else {
      // Fallback to generic mock analysis
      return {
        success: true,
        documentId,
        analysis: {
          insights: generateMockInsights(),
          summary: 'This document has been analyzed using mock data. Upload a new document to see real text extraction and analysis.',
          riskScore: 7.2,
          complianceScore: 8.1
        }
      };
    }
  } else {
    // Real API call
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.processDocument}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Real API processing failed, falling back to mock mode:', error);
      // Fallback to mock mode if real API fails
      localStorage.setItem('apiMode', 'mock');
      return processDocument(documentId);
    }
  }
};

// Q&A API
export const askQuestion = async (documentId: string, question: string): Promise<QAResponse> => {
  const apiMode = await getApiMode();
  
  if (apiMode === 'mock') {
    await mockDelay(1500);
    
    // Get extracted document text if available
    const storedDoc = typeof window !== 'undefined' ? 
      localStorage.getItem(`document_${documentId}`) : null;
    
    let documentText = '';
    if (storedDoc) {
      const extractedDoc = JSON.parse(storedDoc) as ExtractedDocument;
      documentText = extractedDoc.text.toLowerCase();
    }
    
    // Enhanced mock responses based on question content and document text
    const questionLower = question.toLowerCase();
    let answer = 'I\'ll analyze the document to provide you with a comprehensive answer to your question.';
    let confidence = 0.7;
    
    // Smart question matching with document content
    if (questionLower.includes('confidential') && documentText.includes('confidential')) {
      answer = 'According to the document, confidentiality obligations are defined with specific terms and duration. The document contains multiple references to confidential information and its handling.';
      confidence = 0.9;
    } else if (questionLower.includes('term') || questionLower.includes('duration')) {
      if (documentText.includes('five') || documentText.includes('5')) {
        answer = 'Based on the document analysis, the term appears to be five (5) years from the date of disclosure.';
        confidence = 0.9;
      } else {
        answer = 'The document contains term-related clauses. Please refer to the specific section for exact duration details.';
        confidence = 0.7;
      }
    } else if (questionLower.includes('breach') || questionLower.includes('violation')) {
      answer = 'The document includes provisions for breach scenarios, including potential remedies and consequences for violations of the agreement terms.';
      confidence = 0.8;
    } else if (questionLower.includes('termination') || questionLower.includes('end')) {
      answer = 'Termination clauses are present in the document, outlining conditions and procedures for ending the agreement.';
      confidence = 0.8;
    } else if (questionLower.includes('governing') || questionLower.includes('jurisdiction')) {
      if (documentText.includes('delaware')) {
        answer = 'The document is governed by Delaware state law, as specified in the governing law section.';
        confidence = 0.9;
      } else {
        answer = 'The document contains governing law provisions. Please check the jurisdiction section for specific details.';
        confidence = 0.7;
      }
    } else if (questionLower.includes('parties') || questionLower.includes('who')) {
      answer = 'The document defines the parties involved in the agreement. Please refer to the preamble section for specific party identification.';
      confidence = 0.8;
    }
    
    // If we have document text, provide more specific context
    if (documentText && confidence < 0.9) {
      const sentences = documentText.split(/[.!?]+/);
      const relevantSentences = sentences.filter(sentence => 
        questionLower.split(' ').some(word => 
          word.length > 3 && sentence.includes(word)
        )
      );
      
      if (relevantSentences.length > 0) {
        answer = `Based on the document content: ${relevantSentences[0].trim()}.`;
        confidence = 0.85;
      }
    }
    
    return {
      success: true,
      answer,
      confidence,
      sources: documentText ? ['Document Text Analysis'] : ['Mock Analysis']
    };
  } else {
    // Real API call
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.qa}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId, question }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.log('Real API Q&A failed, falling back to mock mode:', error);
      // Fallback to mock mode if real API fails
      localStorage.setItem('apiMode', 'mock');
      return askQuestion(documentId, question);
    }
  }
};