// API configuration and utilities for DocuMint AI

// Environment configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    upload: process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT || '/api/upload',
    processDocument: process.env.NEXT_PUBLIC_PROCESS_ENDPOINT || '/api/v1/process-document',
    qa: process.env.NEXT_PUBLIC_QA_ENDPOINT || '/api/v1/qa',
  },
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB default
  supportedFormats: process.env.NEXT_PUBLIC_SUPPORTED_FORMATS?.split(',') || ['.pdf', '.doc', '.docx'],
};

export interface UploadResponse {
  success: boolean;
  documentId: string;
  filename: string;
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

// Configuration for API mode
export const getApiMode = (): 'mock' | 'real' => {
  if (typeof window === 'undefined') return 'mock';
  return localStorage.getItem('apiMode') as 'mock' | 'real' || 'mock';
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
  const apiMode = getApiMode();
  
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
    
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      documentId,
      filename: file.name,
      message: 'Document uploaded successfully'
    };
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
      return {
        success: false,
        documentId: '',
        filename: file.name,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }
};

// Process document API
export const processDocument = async (documentId: string): Promise<ProcessDocumentResponse> => {
  const apiMode = getApiMode();
  
  if (apiMode === 'mock') {
    await mockDelay(3000);
    
    return {
      success: true,
      documentId,
      analysis: {
        insights: generateMockInsights(),
        summary: 'This Non-Disclosure Agreement contains several standard clauses but has some areas that require attention. The confidentiality scope is quite broad and may face enforceability challenges. Consider adding more specific definitions and mutual confidentiality provisions.',
        riskScore: 7.2,
        complianceScore: 8.1
      }
    };
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
      return {
        success: false,
        documentId,
        analysis: {
          insights: [],
          summary: '',
          riskScore: 0,
          complianceScore: 0
        },
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }
};

// Q&A API
export const askQuestion = async (documentId: string, question: string): Promise<QAResponse> => {
  const apiMode = getApiMode();
  
  if (apiMode === 'mock') {
    await mockDelay(1500);
    
    // Mock responses based on common questions
    const mockAnswers: Record<string, string> = {
      'confidentiality': 'According to Section 2 of the agreement, the confidentiality obligation lasts for five (5) years from the date of disclosure.',
      'breach': 'Section 4 states that any breach would cause irreparable harm, and the Company can seek injunctive relief and other equitable remedies beyond monetary damages.',
      'termination': 'Yes, Section 3 allows either party to terminate with 30 days written notice. Upon termination, all confidential information must be returned or destroyed.',
      'governing': 'This Agreement is governed by the laws of the State of Delaware, as specified in Section 5.',
      'parties': 'The parties are TechCorp Solutions Inc. (Company) and John Smith (Recipient).',
    };
    
    const questionLower = question.toLowerCase();
    let answer = 'I\'ll analyze the document to provide you with a comprehensive answer to your question.';
    let confidence = 0.7;
    
    for (const [key, value] of Object.entries(mockAnswers)) {
      if (questionLower.includes(key)) {
        answer = value;
        confidence = 0.9;
        break;
      }
    }
    
    return {
      success: true,
      answer,
      confidence,
      sources: ['Section 2', 'Section 3', 'Section 4']
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
      return {
        success: false,
        answer: '',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Question processing failed'
      };
    }
  }
};