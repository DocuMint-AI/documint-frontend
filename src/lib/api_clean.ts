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
  if (manualMode) return manualMode; // Respect any manual mode setting
  
  // Check if API is available when no manual setting exists
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

// Export the health check function for use in settings
export const checkBackendHealth = checkApiHealth;

// Mock API delay for realistic simulation
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Load mock data from JSON files
const loadMockInsights = async () => {
  try {
    const response = await fetch('/mock-data/insights.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load mock insights:', error);
    return generateFallbackInsights();
  }
};

const loadMockQAResponses = async () => {
  try {
    const response = await fetch('/mock-data/qa-responses.json');
    const data = await response.json();
    return data.responses;
  } catch (error) {
    console.error('Failed to load mock QA responses:', error);
    return [];
  }
};

const loadMockDocuments = async () => {
  try {
    const response = await fetch('/mock-data/documents.json');
    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error('Failed to load mock documents:', error);
    return [];
  }
};

// Fallback data generators (keeping original as backup)
const generateFallbackInsights = () => ({
  insights: [
    { type: 'Risk', level: 'High', text: 'Overly broad confidentiality scope may be unenforceable', color: 'red' },
    { type: 'Compliance', level: 'Medium', text: 'Missing jurisdiction clause for dispute resolution', color: 'yellow' },
    { type: 'Standard', level: 'Low', text: 'Term length aligns with industry standards', color: 'green' },
    { type: 'Suggestion', level: 'Medium', text: 'Consider adding mutual confidentiality provisions', color: 'yellow' },
  ],
  summary: 'Fallback analysis data loaded.',
  riskScore: 6.5,
  complianceScore: 7.2
});

// Mock data generators
const generateMockInsights = async () => {
  const mockData = await loadMockInsights();
  return mockData.insights;
};

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
      const mockData = await loadMockInsights();
      return {
        success: true,
        documentId,
        analysis: {
          insights: mockData.insights,
          summary: mockData.summary,
          riskScore: mockData.riskScore,
          complianceScore: mockData.complianceScore
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
    
    // Load mock QA responses
    const mockResponses = await loadMockQAResponses();
    
    // Try to find a matching response based on question similarity
    const questionLower = question.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;
    
    for (const response of mockResponses) {
      const responseQuestionLower = response.question.toLowerCase();
      // Simple keyword matching score
      const keywords = questionLower.split(' ').filter(word => word.length > 3);
      let score = 0;
      
      for (const keyword of keywords) {
        if (responseQuestionLower.includes(keyword)) {
          score += 1;
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = response;
      }
    }
    
    if (bestMatch && highestScore > 0) {
      return {
        success: true,
        answer: bestMatch.answer,
        confidence: bestMatch.confidence,
        sources: bestMatch.sources || []
      };
    }
    
    // Fallback response if no good match found
    return {
      success: true,
      answer: 'I\'ve analyzed the document, but I need more specific information to provide a detailed answer. Could you rephrase your question or ask about specific contract terms like payment, confidentiality, termination, or liability?',
      confidence: 0.5,
      sources: ['Document Analysis']
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
