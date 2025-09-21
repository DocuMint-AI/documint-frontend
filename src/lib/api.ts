// API configuration and utilities for DocuMint AI
import { extractDocumentText, generateMockAnalysis, ExtractedDocument } from './documentExtractor';
import { normalizeAnalysis, normalizeInsight, isValidAnalysisResponse, type NormalizedAnalysis } from './insightNormalizer';

// Environment configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000',
  endpoints: {
    // Authentication endpoints
    register: process.env.NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT || '/register',
    login: process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT || '/login',
    logout: process.env.NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT || '/logout',
    me: process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT || '/me',
    
    // Document endpoints
    upload: process.env.NEXT_PUBLIC_BACKEND_UPLOAD_ENDPOINT || '/api/v1/upload',
    processDocument: process.env.NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT || '/api/v1/process-document',
    qa: process.env.NEXT_PUBLIC_BACKEND_QA_ENDPOINT || '/api/v1/qa',
    documents: process.env.NEXT_PUBLIC_BACKEND_DOCUMENTS_ENDPOINT || '/api/v1/documents',
    
    // Health check
    health: process.env.NEXT_PUBLIC_BACKEND_HEALTH_ENDPOINT || '/health',
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
  analysis: NormalizedAnalysis;
  documentAnalysis?: {
    document_type?: any;
    total_insights?: number;
    generic_insights_count?: number;
    specific_insights_count?: number;
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
    console.log('Checking health at:', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`);
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    console.log('Health check response status:', response.status, response.ok);
    return response.ok;
  } catch (error) {
    console.log('API health check failed, falling back to mock mode:', error);
    return false;
  }
}

// Automatically determine API mode based on environment and backend availability
export const getApiMode = async (): Promise<'mock' | 'real'> => {
  if (typeof window === 'undefined') return 'real'; // Default to real on server
  
  // Check for forced mock mode from environment
  const forceMockMode = process.env.NEXT_PUBLIC_FORCE_MOCK_MODE === 'true';
  if (forceMockMode) {
    console.log('Mock mode forced by environment variable');
    return 'mock';
  }
  
  // Always prefer real backend - no more localStorage overrides or detection
  // Remove any stored API mode preferences to force real backend
  localStorage.removeItem('apiMode');
  localStorage.removeItem('detectedApiMode');
  
  console.log('Using real backend mode (hardlocked)');
  return 'real';
};

// Set API mode preference (disabled for hardlocked real backend)
export const setApiMode = (mode: 'mock' | 'real') => {
  if (typeof window !== 'undefined') {
    // Only allow mock mode if forced by environment
    const forceMockMode = process.env.NEXT_PUBLIC_FORCE_MOCK_MODE === 'true';
    if (mode === 'mock' && !forceMockMode) {
      console.warn('Mock mode not allowed - forcing real backend mode');
      return;
    }
    if (!forceMockMode) {
      console.log('API mode setting disabled - hardlocked to real backend');
      return;
    }
    console.log('API mode set to:', mode);
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
      // Get auth token from session
      const { SessionManager } = await import('@/lib/auth');
      const session = SessionManager.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.upload}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Backend returns DocumentUploadResponse with doc_id
      return {
        success: true,
        documentId: result.doc_id,
        filename: result.filename,
        message: 'Document uploaded successfully'
      };
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
      const mockAnalysis = generateMockAnalysis(extractedDoc);
      
      // Normalize the mock analysis to ensure consistent format
      const normalizedAnalysis = normalizeAnalysis(mockAnalysis);
      
      return {
        success: true,
        documentId,
        analysis: normalizedAnalysis
      };
    } else {
      // Fallback to generic mock analysis
      const mockData = await loadMockInsights();
      const normalizedAnalysis = normalizeAnalysis(mockData);
      
      return {
        success: true,
        documentId,
        analysis: normalizedAnalysis
      };
    }
  } else {
    // Real API call
    try {
      // Get auth token from session
      const { SessionManager } = await import('@/lib/auth');
      const session = SessionManager.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.processDocument}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ doc_id: documentId }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Process document response:', result);
      
      // Backend returns success_response format with data field
      if (result.success && result.data) {
        // Validate and normalize the AI response
        if (!isValidAnalysisResponse(result.data)) {
          console.warn('Invalid analysis response format, using fallback');
          throw new Error('Invalid response format from AI service');
        }
        
        const normalizedAnalysis = normalizeAnalysis(result.data);
        
        return {
          success: true,
          documentId,
          analysis: normalizedAnalysis,
          documentAnalysis: result.data.document_analysis || {}
        };
      } else {
        console.error('Backend process document error:', result);
        throw new Error(result.message || 'Unknown error from backend');
      }
    } catch (error) {
      console.log('Real API processing failed, error details:', error);
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
      // Get auth token from session
      const { SessionManager } = await import('@/lib/auth');
      const session = SessionManager.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.qa}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ doc_id: documentId, query: question }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('QA response:', result);
      
      // Backend returns success_response format with data field
      if (result.success && result.data) {
        return {
          success: true,
          answer: result.data.answer || result.data,
          confidence: result.data.confidence || 0.8,
          sources: result.data.sources || []
        };
      } else {
        console.error('Backend QA error:', result);
        throw new Error(result.message || 'Unknown error from backend');
      }
    } catch (error) {
      console.log('Real API Q&A failed, error details:', error);
      // Fallback to mock mode if real API fails
      localStorage.setItem('apiMode', 'mock');
      return askQuestion(documentId, question);
    }
  }
};

