'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Layout from '@/components/Layout';
import DocumentPanel from '@/components/panels/DocumentPanel';
import InsightsPanel from '@/components/panels/InsightsPanel';
import QAPanel from '@/components/panels/QAPanel';
import ResizableDivider from '@/components/ResizableDivider';
import { FileText, Brain, MessageCircle, Maximize2, Minimize2 } from 'lucide-react';

interface Panel {
  id: 'document' | 'insights' | 'qa';
  component: React.ComponentType<{
    expanded: boolean;
    onExpand: () => void;
    onMinimize: () => void;
  }>;
}

export default function WorkspacePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Panel state management
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [minimizedPanel, setMinimizedPanel] = useState<string | null>(null);
  const [panelWidths, setPanelWidths] = useState([33.33, 33.33, 33.34]);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  
  // Panel configurations
  const panels: Panel[] = [
    { id: 'document', component: DocumentPanel },
    { id: 'insights', component: InsightsPanel },
    { id: 'qa', component: QAPanel }
  ];

  // Load current document from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDocument = localStorage.getItem('currentDocument');
      if (savedDocument) {
        setCurrentDocument(JSON.parse(savedDocument));
      }
    }
  }, []);
  
  // Handle panel expansion
  const handlePanelExpand = (panelId: string) => {
    setExpandedPanel(expandedPanel === panelId ? null : panelId);
    setMinimizedPanel(null);
  };

  // Handle panel minimization
  const handlePanelMinimize = (panelId: string) => {
    setMinimizedPanel(minimizedPanel === panelId ? null : panelId);
    setExpandedPanel(null);
  };
  
  // Handle panel resizing
  const handleResize = useCallback((dividerIndex: number, clientX: number) => {
    if (!containerRef.current || expandedPanel || minimizedPanel) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = clientX - containerRect.left;
    const percentage = (relativeX / containerWidth) * 100;
    
    setPanelWidths(prev => {
      const newWidths = [...prev];
      
      if (dividerIndex === 0) {
        const minWidth = 15;
        const maxWidth = 70;
        const constrainedPercentage = Math.max(minWidth, Math.min(maxWidth, percentage));
        
        newWidths[0] = constrainedPercentage;
        newWidths[1] = Math.max(minWidth, 100 - constrainedPercentage - newWidths[2]);
      } else if (dividerIndex === 1) {
        const minWidth = 15;
        const constrainedPercentage = Math.max(minWidth, Math.min(85, percentage));
        
        if (constrainedPercentage > newWidths[0]) {
          newWidths[1] = constrainedPercentage - newWidths[0];
          newWidths[2] = Math.max(minWidth, 100 - constrainedPercentage);
        }
      }
      
      return newWidths;
    });
  }, [expandedPanel, minimizedPanel]);

  // Get visible panels based on state
  const getVisiblePanels = () => {
    if (expandedPanel) {
      return panels.filter(panel => panel.id === expandedPanel);
    }
    if (minimizedPanel) {
      return panels.filter(panel => panel.id !== minimizedPanel);
    }
    return panels;
  };

  const visiblePanels = getVisiblePanels();
  const minimizedPanelData = minimizedPanel ? panels.find(p => p.id === minimizedPanel) : null;

  // Show upload message if no document
  if (!currentDocument) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No Document Loaded
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload a document to start analyzing with AI-powered insights.
            </p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Upload Document
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 font-sans flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Document Analysis Workspace
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentDocument.filename}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Risk Score: <span className="font-semibold text-orange-600">
                  {currentDocument.analysis?.riskScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Compliance Score: <span className="font-semibold text-green-600">
                  {currentDocument.analysis?.complianceScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top panels area */}
          <div
            ref={containerRef}
            className="flex-1 flex bg-gray-100/50 dark:bg-gray-800/50 p-4 gap-1"
          >
            {visiblePanels.map((panel, index) => {
              const Component = panel.component;
              const isExpanded = expandedPanel === panel.id;
              
              // Calculate width for visible panels
              let width;
              if (isExpanded) {
                width = '100%';
              } else if (minimizedPanel) {
                // When one panel is minimized, share space between remaining two
                width = '50%';
              } else {
                width = `${panelWidths[panels.findIndex(p => p.id === panel.id)]}%`;
              }
              
              return (
                <React.Fragment key={panel.id}>
                  {/* Panel */}
                  <div
                    className="panel-transition"
                    style={{
                      width,
                      minWidth: isExpanded ? '100%' : '200px',
                      maxWidth: isExpanded ? '100%' : '70%'
                    }}
                  >
                    <Component
                      expanded={isExpanded}
                      onExpand={() => handlePanelExpand(panel.id)}
                      onMinimize={() => handlePanelMinimize(panel.id)}
                    />
                  </div>
                  
                  {/* Resizable Divider */}
                  {index < visiblePanels.length - 1 && !expandedPanel && !minimizedPanel && (
                    <ResizableDivider
                      onResize={(clientX) => handleResize(index, clientX)}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Minimized panel at bottom */}
          {minimizedPanelData && (
            <div className="h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="h-full flex items-center justify-between px-6 py-2">
                <div className="flex items-center gap-3">
                  {minimizedPanelData.id === 'document' && <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  {minimizedPanelData.id === 'insights' && <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                  {minimizedPanelData.id === 'qa' && <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {minimizedPanelData.id === 'document' && 'Document'}
                    {minimizedPanelData.id === 'insights' && 'AI Insights'}
                    {minimizedPanelData.id === 'qa' && 'Q&A Assistant'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">(minimized)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePanelExpand(minimizedPanelData.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                    aria-label="Expand panel"
                  >
                    <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setMinimizedPanel(null)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                    aria-label="Restore panel"
                  >
                    <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-300 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}