'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';
import LoadingSpinner from '@/components/LoadingSpinner';
import AuthGuard from '@/components/AuthGuard';
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
    canMinimize?: boolean;
  }>;
}

export default function WorkspacePage() {
  const router = useRouter();
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
    
    // Prevent minimizing all panels - ensure at least one panel remains visible
    const currentlyVisible = panels.filter(panel => !minimizedPanels.has(panel.id));
    if (currentlyVisible.length <= 1 && !newMinimized.has(panelId)) {
      // Don't allow minimizing the last visible panel
      return;
    }
    
    if (newMinimized.has(panelId)) {
      newMinimized.delete(panelId);
    } else {
      newMinimized.add(panelId);
    }
    
    // Always reset panel widths to default when minimizing any panel
    // This prevents overflow issues and provides consistent behavior
    const willBeVisible = panels.filter(panel => !newMinimized.has(panel.id));
    const wasExpanded = expandedPanel !== null;
    
    // Simple solution: Always reset to default 33.33% widths when minimizing
    setPanelWidths([33.33, 33.33, 33.34]);
    
    setMinimizedPanels(newMinimized);
    setExpandedPanel(null);
  };

  // Handle restoring a minimized panel
  const handlePanelRestore = (panelId: string) => {
    const newMinimized = new Set(minimizedPanels);
    newMinimized.delete(panelId);
    
    // Handle width transitions when restoring panels
    const currentlyVisible = panels.filter(panel => !minimizedPanels.has(panel.id));
    const willBeVisible = panels.filter(panel => !newMinimized.has(panel.id));
    const wasExpanded = expandedPanel !== null;
    
    if (wasExpanded || (currentlyVisible.length === 2 && willBeVisible.length === 3)) {
      // Going from 2 to 3 panels or from expanded state - reset to equal distribution
      setPanelWidths([33.33, 33.33, 33.34]);
    }
    
    setMinimizedPanels(newMinimized);
    setExpandedPanel(null); // Clear any expanded state when restoring
  };
  
  // Handle panel resizing
  const handleResize = useCallback((dividerIndex: number, clientX: number) => {
    if (!containerRef.current || expandedPanel || isMobile) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const relativeX = clientX - containerRect.left;
    const percentage = (relativeX / containerWidth) * 100;
    
    const visiblePanelsCount = panels.filter(panel => !minimizedPanels.has(panel.id)).length;
    
    setPanelWidths(prev => {
      const newWidths = [...prev];
      
      // Minimum and maximum widths for better UX - more flexible for smaller screens
      const minWidth = 20; // Reduced from 25% to allow tighter layouts
      const maxWidth = 70; // Increased from 60% to allow more flexibility
      
      if (visiblePanelsCount === 2) {
        // Handle 2-panel resizing
        if (dividerIndex === 0) {
          // Only one divider for 2 panels
          const constrainedPercentage = Math.max(minWidth, Math.min(100 - minWidth, percentage));
          
          // Find the indices of visible panels
          const visiblePanelIndices = panels
            .map((panel, index) => ({ panel, index }))
            .filter(item => !minimizedPanels.has(item.panel.id))
            .map(item => item.index);
            
          if (visiblePanelIndices.length === 2) {
            newWidths[visiblePanelIndices[0]] = constrainedPercentage;
            newWidths[visiblePanelIndices[1]] = 100 - constrainedPercentage;
          }
        }
      } else if (visiblePanelsCount === 3) {
        // Handle 3-panel resizing (existing logic)
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
      }
      
      // Final validation: ensure all panels meet minimum requirements and don't exceed 100%
      const totalWidth = newWidths[0] + newWidths[1] + newWidths[2];
      if (Math.abs(totalWidth - 100) > 0.1) { // Allow small floating point errors
        // Normalize to exactly 100% to prevent overflow
        const factor = 100 / totalWidth;
        newWidths[0] *= factor;
        newWidths[1] *= factor;
        newWidths[2] *= factor;
      }
      
      // Ensure no panel is below minimum width for visible panels
      const visiblePanelIndices = panels
        .map((panel, index) => ({ panel, index }))
        .filter(item => !minimizedPanels.has(item.panel.id))
        .map(item => item.index);
        
      for (const i of visiblePanelIndices) {
        if (newWidths[i] < minWidth) {
          return prev; // Return previous state if constraints can't be met
        }
      }
      
      // Final safety check: ensure total visible width doesn't exceed 100%
      const visibleTotalWidth = visiblePanelIndices.reduce((sum, i) => sum + newWidths[i], 0);
      if (visibleTotalWidth > 100) {
        return prev; // Return previous state to prevent overflow
      }
      
      return newWidths;
    });
  }, [expandedPanel, minimizedPanels, isMobile, panels]);

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

  // Show upload message if no document - automatically redirect to upload
  if (!currentDocument) {
    // Auto-redirect to upload page
    useEffect(() => {
      router.push('/upload');
    }, [router]);
    
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Redirecting to Upload
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No document found. Redirecting you to upload a document...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <AuthGuard>
      <Layout>
      <div className="h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] bg-gray-50 dark:bg-black font-sans flex flex-col overflow-hidden relative">
        {/* Neon halo background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-3xl animate-float-blob-1"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 blur-3xl animate-float-blob-2"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl animate-float-blob-3"></div>
        </div>
        {/* Header */}
        <div className="flex-shrink-0 p-2 md:p-4 bg-gray-100/20 dark:bg-gray-800/20 border-b border-gray-200/30 dark:border-gray-700/30 shadow-sm relative z-10">
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
            className={`flex-1 bg-gray-100/50 dark:bg-gray-950 p-2 md:p-4 gap-1 md:gap-2 min-h-0 workspace-container ${
              isMobile ? 'flex flex-col overflow-auto' : 'flex overflow-hidden'
            }`}
            style={!isMobile ? { 
              overflowX: 'hidden' // Prevent horizontal scrolling
            } : {}}
          >
            {visiblePanels.map((panel, index) => {
              const Component = panel.component;
              const isExpanded = expandedPanel === panel.id;
              const canMinimize = visiblePanels.length > 1; // Can only minimize if more than 1 panel is visible
              
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
                    // For 2 panels, ensure they share the full width
                    const visiblePanelIds = visiblePanels.map(p => p.id);
                    const currentPanelVisibleIndex = visiblePanelIds.indexOf(panel.id);
                    
                    // Get the indices of the visible panels in the original panels array
                    const visiblePanelIndices = panels
                      .map((p, i) => ({ panel: p, index: i }))
                      .filter(item => !minimizedPanels.has(item.panel.id))
                      .map(item => item.index);
                    
                    if (visiblePanelIndices.length === 2) {
                      // Calculate widths ensuring they add up to 100%
                      const width1 = panelWidths[visiblePanelIndices[0]];
                      const width2 = panelWidths[visiblePanelIndices[1]];
                      const totalWidth = width1 + width2;
                      
                      if (currentPanelVisibleIndex === 0) {
                        width = `${totalWidth > 0 ? (width1 / totalWidth) * 100 : 50}%`;
                      } else {
                        width = `${totalWidth > 0 ? (width2 / totalWidth) * 100 : 50}%`;
                      }
                    } else {
                      width = '50%'; // fallback
                    }
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
                      maxWidth: isMobile ? '100%' : (isExpanded ? '100%' : '70%'),
                      height: isMobile ? '100%' : 'auto'
                    }}
                  >
                    <Component
                      expanded={isExpanded}
                      onExpand={() => handlePanelExpand(panel.id)}
                      onMinimize={() => handlePanelMinimize(panel.id)}
                      canMinimize={canMinimize}
                    />
                  </div>
                  
                  {/* Resizable Divider - Desktop only */}
                  {!isMobile && index < visiblePanels.length - 1 && !expandedPanel && visiblePanels.length >= 2 && (
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
    </AuthGuard>
  );
}