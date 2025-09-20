'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';
import LoadingSpinner from '@/components/LoadingSpinner';
import DocumentPanel from '@/components/panels/DocumentPanel';
import InsightsPanel from '@/components/panels/InsightsPanel';
import QAPanel from '@/components/panels/QAPanel';
import ResizableDivider from '@/components/ResizableDivider';
import { FileText, Brain, MessageCircle, Maximize2, Minimize2, X, File, Type, BookOpen, Calendar } from 'lucide-react';

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
  const [minimizedPanels, setMinimizedPanels] = useState<Set<string>>(new Set());
  const [panelWidths, setPanelWidths] = useState([33.33, 33.33, 33.34]);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [documentMetadata, setDocumentMetadata] = useState<any>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataLoadingMessage, setDataLoadingMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<'document' | 'insights' | 'qa'>('document');
  
  // Panel configurations
  const panels: Panel[] = [
    { id: 'document', component: DocumentPanel },
    { id: 'insights', component: InsightsPanel },
    { id: 'qa', component: QAPanel }
  ];

  // Load current document from localStorage
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (typeof window !== 'undefined') {
      // Check mobile screen size
      setIsMobile(window.innerWidth < 1024);
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
      };
      
      window.addEventListener('resize', handleResize);
      cleanup = () => window.removeEventListener('resize', handleResize);
      
      // Check if there's a document being processed
      const processingDoc = localStorage.getItem('processingDocument');
      if (processingDoc) {
        setIsDataLoading(true);
        setDataLoadingMessage('Processing document with AI...');
        
        // Simulate processing time for demo - in real app this would check actual status
        setTimeout(() => {
          const savedDocument = localStorage.getItem('currentDocument');
          if (savedDocument) {
            setCurrentDocument(JSON.parse(savedDocument));
            localStorage.removeItem('processingDocument');
          }
          setIsDataLoading(false);
          setDataLoadingMessage('');
        }, 3000);
      } else {
        const savedDocument = localStorage.getItem('currentDocument');
        if (savedDocument) {
          const doc = JSON.parse(savedDocument);
          setCurrentDocument(doc);
          
          // Get extracted document metadata
          const extractedDoc = localStorage.getItem(`document_${doc.id}`);
          if (extractedDoc) {
            const metadata = JSON.parse(extractedDoc);
            setDocumentMetadata({
              ...metadata,
              uploadedAt: localStorage.getItem(`document_${doc.id}_uploaded`) || new Date().toISOString()
            });
          }
        }
      }
    }
    
    // Always set page loading to false, regardless of window availability
    setIsPageLoading(false);
    
    return cleanup;
  }, []);
  
  // Handle panel expansion
  const handlePanelExpand = (panelId: string) => {
    setExpandedPanel(expandedPanel === panelId ? null : panelId);
    // Clear all minimized panels when expanding
    setMinimizedPanels(new Set());
  };

  // Handle panel minimization
  const handlePanelMinimize = (panelId: string) => {
    const newMinimized = new Set(minimizedPanels);
    if (newMinimized.has(panelId)) {
      newMinimized.delete(panelId);
    } else {
      newMinimized.add(panelId);
    }
    setMinimizedPanels(newMinimized);
    setExpandedPanel(null);
  };

  // Handle restoring a minimized panel
  const handlePanelRestore = (panelId: string) => {
    const newMinimized = new Set(minimizedPanels);
    newMinimized.delete(panelId);
    setMinimizedPanels(newMinimized);
  };
  
  // Handle panel resizing
  const handleResize = useCallback((dividerIndex: number, clientX: number) => {
    if (!containerRef.current || expandedPanel || minimizedPanels.size > 0 || isMobile) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = clientX - containerRect.left;
    const percentage = (relativeX / containerWidth) * 100;
    
    setPanelWidths(prev => {
      const newWidths = [...prev];
      
      // Minimum and maximum widths for better UX and prevent overflow
      const minWidth = 25; // Increased from 15% to prevent panels becoming too small
      const maxWidth = 60; // Reduced from 70% to prevent panels becoming too large
      
      if (dividerIndex === 0) {
        // First divider: controls first panel width
        const constrainedPercentage = Math.max(minWidth, Math.min(maxWidth, percentage));
        
        newWidths[0] = constrainedPercentage;
        
        // Ensure remaining panels have adequate space
        const remainingSpace = 100 - constrainedPercentage;
        const minRemainingEach = minWidth;
        
        if (remainingSpace >= minRemainingEach * 2) {
          // Distribute remaining space between panels 1 and 2, keeping their ratio
          const currentTotal = newWidths[1] + newWidths[2];
          if (currentTotal > 0) {
            const ratio1 = newWidths[1] / currentTotal;
            const ratio2 = newWidths[2] / currentTotal;
            newWidths[1] = remainingSpace * ratio1;
            newWidths[2] = remainingSpace * ratio2;
          } else {
            // Equal distribution if no previous ratio
            newWidths[1] = remainingSpace / 2;
            newWidths[2] = remainingSpace / 2;
          }
        } else {
          // Force equal minimum distribution
          newWidths[1] = minRemainingEach;
          newWidths[2] = remainingSpace - minRemainingEach;
        }
        
      } else if (dividerIndex === 1) {
        // Second divider: controls second panel width relative to combined first two panels
        const maxSecondDividerPos = 100 - minWidth; // Leave space for third panel
        const constrainedPercentage = Math.max(newWidths[0] + minWidth, Math.min(maxSecondDividerPos, percentage));
        
        // Calculate new second panel width
        const newSecondWidth = constrainedPercentage - newWidths[0];
        
        // Ensure second panel meets minimum requirements
        if (newSecondWidth >= minWidth) {
          newWidths[1] = newSecondWidth;
          newWidths[2] = Math.max(minWidth, 100 - constrainedPercentage);
        }
      }
      
      // Final validation: ensure all panels meet minimum requirements
      const totalWidth = newWidths[0] + newWidths[1] + newWidths[2];
      if (Math.abs(totalWidth - 100) > 0.1) { // Allow small floating point errors
        // Normalize to 100%
        const factor = 100 / totalWidth;
        newWidths[0] *= factor;
        newWidths[1] *= factor;
        newWidths[2] *= factor;
      }
      
      // Ensure no panel is below minimum width
      for (let i = 0; i < newWidths.length; i++) {
        if (newWidths[i] < minWidth) {
          return prev; // Return previous state if constraints can't be met
        }
      }
      
      return newWidths;
    });
  }, [expandedPanel, minimizedPanels, isMobile]);

  // Get visible panels based on state
  const getVisiblePanels = () => {
    if (isMobile) {
      // Mobile: show only the active panel
      return panels.filter(panel => panel.id === activeMobilePanel);
    }
    if (expandedPanel) {
      return panels.filter(panel => panel.id === expandedPanel);
    }
    return panels.filter(panel => !minimizedPanels.has(panel.id));
  };

  const visiblePanels = getVisiblePanels();
  const minimizedPanelsList = panels.filter(panel => minimizedPanels.has(panel.id));

  // Show page loading
  if (isPageLoading) {
    return <PageLoader text="Loading workspace..." />;
  }

  // Show data loading overlay when processing
  if (isDataLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <LoadingSpinner size="lg" text={dataLoadingMessage} />
        </div>
      </Layout>
    );
  }

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
      <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black font-sans flex flex-col overflow-hidden stars-bg">
        {/* Header */}
        <div className="flex-shrink-0 p-2 md:p-4 bg-gray-100/20 dark:bg-gray-800/20 border-b border-gray-200/30 dark:border-gray-700/30 shadow-sm">
          <div className="min-w-0 ml-0 md:ml-2">
            <h1 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              Document Analysis Workspace
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
              <p className="text-gray-600 dark:text-gray-400 truncate font-medium">
                {currentDocument.filename}
              </p>
              {documentMetadata && (
                <div className="hidden md:flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {documentMetadata.fileSize && (
                    <span className="whitespace-nowrap flex items-center gap-1">
                      <File className="w-3 h-3" /> {(documentMetadata.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                  {documentMetadata.wordCount && (
                    <span className="whitespace-nowrap flex items-center gap-1">
                      <Type className="w-3 h-3" /> {documentMetadata.wordCount.toLocaleString()} words
                    </span>
                  )}
                  {documentMetadata.pageCount && (
                    <span className="whitespace-nowrap flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {documentMetadata.pageCount} pages
                    </span>
                  )}
                  {documentMetadata.uploadedAt && (
                    <span className="whitespace-nowrap flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(documentMetadata.uploadedAt).toLocaleDateString()} {new Date(documentMetadata.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top panels area */}
          <div
            ref={containerRef}
            className={`flex-1 bg-gray-100/50 dark:bg-gray-950 p-2 md:p-4 gap-1 md:gap-2 min-h-0 overflow-auto workspace-container ${
              isMobile ? 'flex flex-col' : 'flex'
            }`}
            style={!isMobile ? { 
              minWidth: visiblePanels.length === 3 ? '900px' : visiblePanels.length === 2 ? '600px' : '320px',
              overflowX: 'auto'
            } : {}}
          >
            {visiblePanels.map((panel, index) => {
              const Component = panel.component;
              const isExpanded = expandedPanel === panel.id;
              
              // Mobile-first responsive width calculation
              let width;
              let className = 'panel-transition min-h-0 overflow-hidden flex-shrink-0';
              
              if (isMobile) {
                // Mobile: single panel, full width and height
                width = '100%';
                className += ' w-full h-full';
              } else {
                // Desktop: preserve original layout logic
                if (isExpanded) {
                  width = '100%';
                } else {
                  const visibleCount = visiblePanels.length;
                  if (visibleCount === 1) {
                    width = '100%';
                  } else if (visibleCount === 2) {
                    width = '50%';
                  } else {
                    width = `${panelWidths[panels.findIndex(p => p.id === panel.id)]}%`;
                  }
                }
              }
              
              return (
                <React.Fragment key={panel.id}>
                  {/* Panel */}
                  <div
                    className={className}
                    style={{
                      width,
                      minWidth: isMobile ? '100%' : (isExpanded ? '100%' : visiblePanels.length === 1 ? '100%' : '280px'),
                      maxWidth: isMobile ? '100%' : (isExpanded ? '100%' : '70%'),
                      height: isMobile ? '100%' : 'auto'
                    }}
                  >
                    <Component
                      expanded={isExpanded}
                      onExpand={() => handlePanelExpand(panel.id)}
                      onMinimize={() => handlePanelMinimize(panel.id)}
                    />
                  </div>
                  
                  {/* Resizable Divider - Desktop only */}
                  {!isMobile && index < visiblePanels.length - 1 && !expandedPanel && minimizedPanels.size === 0 && visiblePanels.length === 3 && (
                    <ResizableDivider
                      onResize={(clientX) => handleResize(index, clientX)}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Mobile Panel Navigation */}
          {isMobile && (
            <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-center p-1.5 gap-1">
                {panels.map((panel) => {
                  const getPanelIcon = (panelId: string) => {
                    switch (panelId) {
                      case 'document':
                        return <FileText className="w-4 h-4 flex-shrink-0" />;
                      case 'insights':
                        return <Brain className="w-4 h-4 flex-shrink-0" />;
                      case 'qa':
                        return <MessageCircle className="w-4 h-4 flex-shrink-0" />;
                      default:
                        return null;
                    }
                  };

                  const getPanelName = (panelId: string) => {
                    switch (panelId) {
                      case 'document':
                        return 'Document';
                      case 'insights':
                        return 'Insights';
                      case 'qa':
                        return 'Q&A';
                      default:
                        return panelId;
                    }
                  };

                  const isActive = activeMobilePanel === panel.id;
                  const getColors = (panelId: string, isActive: boolean) => {
                    if (isActive) {
                      switch (panelId) {
                        case 'document':
                          return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
                        case 'insights':
                          return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
                        case 'qa':
                          return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
                        default:
                          return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
                      }
                    } else {
                      return 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800';
                    }
                  };

                  return (
                    <button
                      key={panel.id}
                      onClick={() => setActiveMobilePanel(panel.id as 'document' | 'insights' | 'qa')}
                      className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-md transition-all duration-200 min-w-0 flex-1 max-w-[100px] ${getColors(panel.id, isActive)}`}
                      title={getPanelName(panel.id)}
                    >
                      {getPanelIcon(panel.id)}
                      <span className="text-[10px] font-medium truncate leading-tight">
                        {getPanelName(panel.id)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desktop Minimized panels tabs */}
          {!isMobile && minimizedPanelsList.length > 0 && (
            <div className="flex-shrink-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-1 p-2 md:p-3 overflow-x-auto">
                {minimizedPanelsList.map((panel) => {
                  const getPanelIcon = (panelId: string) => {
                    switch (panelId) {
                      case 'document':
                        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
                      case 'insights':
                        return <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />;
                      case 'qa':
                        return <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />;
                      default:
                        return null;
                    }
                  };

                  const getPanelName = (panelId: string) => {
                    switch (panelId) {
                      case 'document':
                        return 'Document';
                      case 'insights':
                        return 'AI Insights';
                      case 'qa':
                        return 'Q&A Assistant';
                      default:
                        return panelId;
                    }
                  };

                  return (
                    <button
                      key={panel.id}
                      onClick={() => handlePanelRestore(panel.id)}
                      className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 min-w-0 flex-shrink-0 ${isMobile ? 'text-xs' : 'text-sm'}`}
                      title={`Restore ${getPanelName(panel.id)}`}
                    >
                      {getPanelIcon(panel.id)}
                      <span className={`font-medium text-gray-700 dark:text-gray-300 truncate ${isMobile ? 'hidden sm:inline' : ''}`}>
                        {getPanelName(panel.id)}
                      </span>
                      <Maximize2 className="w-3 h-3 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    </button>
                  );
                })}
                
                {/* Clear all minimized button */}
                {minimizedPanelsList.length > 1 && (
                  <button
                    onClick={() => setMinimizedPanels(new Set())}
                    className={`flex items-center gap-1 px-2 py-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 flex-shrink-0 ${isMobile ? 'ml-1' : 'ml-2'}`}
                    title="Restore all panels"
                  >
                    <X className="w-3 h-3" />
                    <span className={isMobile ? 'hidden sm:inline' : ''}>
                      Clear All
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}