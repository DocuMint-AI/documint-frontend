'use client';

import React from 'react';
import { Maximize2, Minimize2, FileText, Minus } from 'lucide-react';

interface DocumentPanelProps {
  expanded: boolean;
  onExpand: () => void;
  onMinimize: () => void;
}

const DocumentPanel: React.FC<DocumentPanelProps> = ({ expanded, onExpand, onMinimize }) => {
  const expandedContent = [
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-600 bg-blue-50/30 dark:bg-blue-900/30">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Document</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Minimize panel"
          >
            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
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
        <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contract Agreement - NDA-2024-001</p>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              This Non-Disclosure Agreement ("Agreement") is entered into on January 15, 2024, 
              between TechCorp Solutions Inc., a Delaware corporation ("Company"), and John Smith, 
              an individual ("Recipient").
            </p>
            
            <div>
              <p className="font-semibold mb-2">1. Definition of Confidential Information</p>
              <p>
                For purposes of this Agreement, "Confidential Information" shall include all non-public, 
                proprietary or confidential information, technical data, trade secrets, know-how, 
                research, product plans, products, services, customers, customer lists, markets, 
                software, developments, inventions, processes, formulas, technology, designs, 
                drawings, engineering, hardware configuration information, marketing, finances, 
                or other business information disclosed by Company.
              </p>
            </div>
            
            <div>
              <p className="font-semibold mb-2">2. Obligations of Receiving Party</p>
              <p>
                Recipient agrees to hold and maintain the Confidential Information in strict confidence 
                for a period of five (5) years from the date of disclosure. Recipient shall not disclose 
                any Confidential Information to third parties without the prior written consent of Company. 
                Recipient shall use the same degree of care that it uses to protect its own confidential 
                information, but in no event less than reasonable care.
              </p>
            </div>
            
            {/* Show additional content when expanded */}
            {expanded && expandedContent.map((section, index) => (
              <div key={index}>
                <p className="font-semibold mb-2">{section.section}</p>
                <p>{section.content}</p>
              </div>
            ))}
            
            {!expanded && (
              <p className="text-gray-500 dark:text-gray-400 italic">
                [Document continues with additional clauses and terms...]
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPanel;