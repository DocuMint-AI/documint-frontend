'use client';

import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, FileText, Minus } from 'lucide-react';
import { extractTextFromDocument, getApiMode } from '@/lib/api';

interface DocumentPanelProps {
  expanded: boolean;
  onExpand: () => void;
  onMinimize: () => void;
  canMinimize?: boolean;
}

interface DocumentData {
  text?: string;
  filename?: string;
  wordCount?: number;
  pageCount?: number;
}

const DocumentPanel: React.FC<DocumentPanelProps> = ({ expanded, onExpand, onMinimize, canMinimize = true }) => {
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiMode, setApiModeState] = useState<'mock' | 'real'>('mock');

  useEffect(() => {
    const loadDocumentData = async () => {
      setIsLoading(true);
      
      // Load document data from current document in localStorage
      if (typeof window !== 'undefined') {
        const currentDoc = localStorage.getItem('currentDocument');
        if (!currentDoc) {
          setIsLoading(false);
          return;
        }

        const doc = JSON.parse(currentDoc);
        const currentApiMode = await getApiMode();
        setApiModeState(currentApiMode);

        if (currentApiMode === 'real') {
          // In real mode, call OCR endpoint to get extracted text
          try {
            const ocrResponse = await extractTextFromDocument(doc.id);
            if (ocrResponse.success) {
              setDocumentData({
                text: ocrResponse.extractedText,
                filename: doc.filename,
                wordCount: ocrResponse.wordCount,
                pageCount: ocrResponse.pages
              });
            } else {
              // Fall back to stored data if OCR fails
              handleFallbackData(doc);
            }
          } catch (error) {
            console.error('OCR extraction failed:', error);
            handleFallbackData(doc);
          }
        } else {
          // In mock mode, use existing logic
          handleFallbackData(doc);
        }
      }
      
      setIsLoading(false);
    };

    const handleFallbackData = (doc: any) => {
      // Check if we have extracted text stored separately
      const extractedDoc = localStorage.getItem(`document_${doc.id}`);
      if (extractedDoc) {
        const extracted = JSON.parse(extractedDoc);
        setDocumentData({
          text: extracted.text,
          filename: extracted.filename,
          wordCount: extracted.wordCount,
          pageCount: extracted.pageCount
        });
      } else if (doc.analysis?.extractedText) {
        setDocumentData({
          text: doc.analysis.extractedText,
          filename: doc.filename,
          wordCount: doc.analysis.extractedText.split(/\s+/).length
        });
      } else {
        // Fallback to default mock content
        setDocumentData({
          filename: doc.filename || 'Contract Agreement - NDA-2024-001'
        });
      }
    };

    loadDocumentData();
  }, []);

  const mockContent = `This Non-Disclosure Agreement ("Agreement") is entered into on January 15, 2024, between TechCorp Solutions Inc., a Delaware corporation ("Company"), and John Smith, an individual ("Recipient").

1. Definition of Confidential Information

For purposes of this Agreement, "Confidential Information" shall include all non-public, proprietary or confidential information, technical data, trade secrets, know-how, research, product plans, products, services, customers, customer lists, markets, software, developments, inventions, processes, formulas, technology, designs, drawings, engineering, hardware configuration information, marketing, finances, or other business information disclosed by Company.

2. Obligations of Receiving Party

Recipient agrees to hold and maintain the Confidential Information in strict confidence for a period of five (5) years from the date of disclosure. Recipient shall not disclose any Confidential Information to third parties without the prior written consent of Company. Recipient shall use the same degree of care that it uses to protect its own confidential information, but in no event less than reasonable care.`;

  const additionalMockContent = [
    {
      section: "3. Term and Termination",
      content: "This Agreement shall remain in effect until terminated by either party with thirty (30) days written notice. Upon termination, all Confidential Information must be returned or destroyed at the Company's discretion."
    },
    {
      section: "4. Remedies", 
      content: "Recipient acknowledges that any breach of this Agreement would cause irreparable harm to Company, and that monetary damages would be inadequate compensation. Therefore, Company shall be entitled to seek injunctive relief and other equitable remedies."
    },
    {
      section: "5. Governing Law",
      content: "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of laws principles."
    },
    {
      section: "6. Entire Agreement",
      content: "This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, negotiations and discussions."
    }
  ];

  const displayText = documentData?.text || mockContent;
  const displayParagraphs = displayText.split('\n\n').filter(p => p.trim());

  return (
    <div className="h-full flex flex-col bg-white/15 dark:bg-gray-900/15 rounded-lg shadow-lg border-2 border-white/30 dark:border-gray-600/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-100/30 dark:border-gray-700/30 bg-blue-50/20 dark:bg-blue-900/20">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Document</h2>
            {documentData?.wordCount && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {documentData.wordCount} words{documentData.pageCount ? ` • ${documentData.pageCount} pages` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Minimize panel"
            >
              <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <button
            onClick={onExpand}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-blue-700 dark:text-blue-300" /> : <Maximize2 className="w-4 h-4 text-blue-700 dark:text-blue-300" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-gray-50/10 dark:bg-gray-800/10 backdrop-blur-sm rounded-lg p-4 space-y-4 border border-gray-200/20 dark:border-gray-600/20">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {documentData?.filename || 'Contract Agreement - NDA-2024-001'}
            </p>
            {apiMode === 'real' && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Real API • OCR Processed
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500">
                  {apiMode === 'real' ? 'Processing document with OCR...' : 'Loading document...'}
                </span>
              </div>
            ) : (
              <>
                {displayParagraphs.slice(0, expanded ? displayParagraphs.length : 3).map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {paragraph.trim()}
                  </p>
                ))}
                
                {/* Show additional mock content when expanded and using fallback */}
                {expanded && !documentData?.text && additionalMockContent.map((section, index) => (
                  <div key={index}>
                    <p className="font-semibold mb-2">{section.section}</p>
                    <p>{section.content}</p>
                  </div>
                ))}
                
                {!expanded && displayParagraphs.length > 3 && (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    [Document continues with additional content...]
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPanel;