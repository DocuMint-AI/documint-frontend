// Document text extraction utilities for PDF and DOCX files

import * as mammoth from 'mammoth';

// Dynamic import for PDF.js to avoid server-side issues
let pdfjsLib: any = null;

// Configure PDF.js worker only on client side
const initPDFJS = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
  }
  return pdfjsLib;
};

export interface ExtractedDocument {
  text: string;
  filename: string;
  fileSize: number;
  pageCount?: number;
  wordCount: number;
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<ExtractedDocument> {
  try {
    const pdfjs = await initPDFJS();
    if (!pdfjs) {
      throw new Error('PDF.js not available in server environment');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return {
      text: fullText.trim(),
      filename: file.name,
      fileSize: file.size,
      pageCount: pdf.numPages,
      wordCount: fullText.trim().split(/\s+/).length
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF file');
  }
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<ExtractedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const text = result.value;
    
    return {
      text: text.trim(),
      filename: file.name,
      fileSize: file.size,
      wordCount: text.trim().split(/\s+/).length
    };
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
}

/**
 * Extract text from DOC file (simplified approach)
 */
export async function extractTextFromDOC(file: File): Promise<ExtractedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const text = result.value;
    
    return {
      text: text.trim(),
      filename: file.name,
      fileSize: file.size,
      wordCount: text.trim().split(/\s+/).length
    };
  } catch (error) {
    console.error('Error extracting text from DOC:', error);
    throw new Error('Failed to extract text from DOC file');
  }
}

/**
 * Main text extraction function that handles different file types
 */
export async function extractDocumentText(file: File): Promise<ExtractedDocument> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (fileName.endsWith('.docx')) {
    return extractTextFromDOCX(file);
  } else if (fileName.endsWith('.doc')) {
    return extractTextFromDOC(file);
  } else {
    throw new Error(`Unsupported file format: ${fileName}`);
  }
}

/**
 * Generate mock analysis based on extracted text
 */
export function generateMockAnalysis(extractedDoc: ExtractedDocument) {
  const text = extractedDoc.text.toLowerCase();
  
  // Basic keyword analysis for mock insights
  const riskKeywords = ['liable', 'penalty', 'termination', 'breach', 'indemnif', 'liquidated damages'];
  const complianceKeywords = ['jurisdiction', 'governing law', 'dispute resolution', 'notice', 'effective date'];
  const confidentialityKeywords = ['confidential', 'proprietary', 'non-disclosure', 'trade secret'];
  
  const riskCount = riskKeywords.reduce((count, keyword) => 
    count + (text.match(new RegExp(keyword, 'gi')) || []).length, 0);
  const complianceCount = complianceKeywords.reduce((count, keyword) => 
    count + (text.match(new RegExp(keyword, 'gi')) || []).length, 0);
  const confidentialityCount = confidentialityKeywords.reduce((count, keyword) => 
    count + (text.match(new RegExp(keyword, 'gi')) || []).length, 0);
  
  // Generate insights based on content analysis
  const insights = [];
  
  if (confidentialityCount > 0) {
    insights.push({
      type: 'Confidentiality',
      level: confidentialityCount > 5 ? 'High' : 'Medium',
      text: `Document contains ${confidentialityCount} confidentiality-related terms`,
      color: confidentialityCount > 5 ? 'green' : 'yellow'
    });
  }
  
  if (riskCount > 2) {
    insights.push({
      type: 'Risk',
      level: 'High',
      text: 'Multiple risk-related clauses detected - review termination and liability terms',
      color: 'red'
    });
  }
  
  if (complianceCount < 2) {
    insights.push({
      type: 'Compliance',
      level: 'Medium',
      text: 'Consider adding more specific governance and dispute resolution clauses',
      color: 'yellow'
    });
  }
  
  if (extractedDoc.wordCount > 1000) {
    insights.push({
      type: 'Analysis',
      level: 'Low',
      text: 'Comprehensive document length allows for detailed analysis',
      color: 'green'
    });
  }
  
  // Calculate scores based on content
  const riskScore = Math.min(9.5, 5 + (riskCount * 0.5));
  const complianceScore = Math.min(9.5, 6 + (complianceCount * 0.3));
  
  return {
    insights,
    summary: `This document contains ${extractedDoc.wordCount} words${extractedDoc.pageCount ? ` across ${extractedDoc.pageCount} pages` : ''}. Analysis shows ${confidentialityCount} confidentiality terms, ${riskCount} risk-related clauses, and ${complianceCount} compliance indicators. ${insights.length > 0 ? 'Key areas identified for review include ' + insights.map(i => i.type.toLowerCase()).join(', ') + '.' : 'Document appears to follow standard legal structure.'}`,
    riskScore,
    complianceScore,
    extractedText: extractedDoc.text
  };
}