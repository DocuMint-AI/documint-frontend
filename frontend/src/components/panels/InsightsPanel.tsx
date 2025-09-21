'use client';

import React, { useEffect, useState } from 'react';
import { Brain, Maximize2, Minimize2, Minus } from 'lucide-react';
import { getApiMode, processDocument } from '@/lib/api';
import { type NormalizedInsight } from '@/lib/insightNormalizer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface InsightsPanelProps {
  expanded: boolean;
  onExpand: () => void;
  onMinimize: () => void;
  canMinimize?: boolean;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ expanded, onExpand, onMinimize, canMinimize = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [apiMode, setCurrentApiMode] = useState<'mock' | 'real'>('mock');
  const [insights, setInsights] = useState<NormalizedInsight[]>([]);

  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true);
      
      // Check API mode
      const mode = await getApiMode();
      setCurrentApiMode(mode);
      
      if (mode === 'real') {
        // Get current document
        const currentDoc = localStorage.getItem('currentDocument');
        if (currentDoc) {
          const doc = JSON.parse(currentDoc);
          
          // Check if this document was uploaded in real mode (UUID format vs mock format)
          if (!doc.id || doc.id.startsWith('doc_')) {
            console.log('Document was uploaded in mock mode, showing message to re-upload');
            setInsights([{
              type: 'Info',
              level: 'Medium', 
              text: 'This document was uploaded in demo mode. Please upload a new document to use real AI analysis.',
              color: 'blue'
            }]);
            setIsLoading(false);
            return;
          }
          
          // Check if we already have insights cached
          if (doc.analysis?.insights) {
            setInsights(doc.analysis.insights);
          } else {
            // Call the real backend API
            setIsDataLoading(true);
            try {
              console.log('Calling real backend for insights with documentId:', doc.id);
              const response = await processDocument(doc.id);
              
              if (response.success && response.analysis?.insights) {
                setInsights(response.analysis.insights);
                
                // Cache the insights in the document
                const updatedDoc = {
                  ...doc,
                  analysis: {
                    ...doc.analysis,
                    ...response.analysis
                  }
                };
                localStorage.setItem('currentDocument', JSON.stringify(updatedDoc));
              } else {
                console.error('Backend returned no insights:', response);
                setInsights([{
                  type: 'Info',
                  level: 'High',
                  text: 'Failed to analyze document with real backend. Please try uploading again.',
                  color: 'red'
                }]);
              }
            } catch (error) {
              console.error('Failed to load insights from backend:', error);
              setInsights([{
                type: 'Info', 
                level: 'High',
                text: 'Backend analysis failed. Please check your connection and try again.',
                color: 'red'
              }]);
            } finally {
              setIsDataLoading(false);
            }
          }
        } else {
          setInsights([{
            type: 'Info',
            level: 'Medium',
            text: 'No document uploaded. Please upload a document to begin analysis.',
            color: 'blue'
          }]);
        }
      } else {
        // Mock mode - use default insights
        setInsights(getDefaultInsights());
      }
      
      setIsLoading(false);
    };
    
    loadInsights();
  }, []);

  // Listen for API mode changes
  useEffect(() => {
    const handleApiModeChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const newMode = customEvent.detail.mode;
      console.log('InsightsPanel: API mode changed to', newMode);
      setCurrentApiMode(newMode);
      
      // Reload insights with new mode
      if (newMode === 'real') {
        const currentDoc = localStorage.getItem('currentDocument');
        if (currentDoc) {
          const doc = JSON.parse(currentDoc);
          
          // Check if this document was uploaded in real mode
          if (!doc.id || doc.id.startsWith('doc_')) {
            console.log('Document was uploaded in mock mode, cannot process with real API');
            setInsights([{
              type: 'Info',
              level: 'Medium',
              text: 'Please upload a new document to use real backend analysis',
              color: 'blue'
            }]);
            return;
          }
          
          setIsDataLoading(true);
          try {
            const response = await processDocument(doc.id);
            if (response.success && response.analysis?.insights) {
              setInsights(response.analysis.insights);
            }
          } catch (error) {
            console.error('Error reloading insights with real API:', error);
            setInsights(getDefaultInsights());
          } finally {
            setIsDataLoading(false);
          }
        }
      } else {
        // Switch to mock data
        setInsights(getDefaultInsights());
      }
    };

    window.addEventListener('apiModeChanged', handleApiModeChange);
    
    return () => {
      window.removeEventListener('apiModeChanged', handleApiModeChange);
    };
  }, []);

  const getDefaultInsights = (): NormalizedInsight[] => {
    const baseInsights: NormalizedInsight[] = [
      { type: 'Risk', level: 'High', text: 'Overly broad confidentiality scope may be unenforceable', color: 'red' },
      { type: 'Compliance', level: 'Medium', text: 'Missing jurisdiction clause for dispute resolution', color: 'yellow' },
      { type: 'Standard', level: 'Low', text: 'Term length aligns with industry standards', color: 'green' },
      { type: 'Suggestion', level: 'Medium', text: 'Consider adding mutual confidentiality provisions', color: 'yellow' }
    ];

    const expandedInsights: NormalizedInsight[] = [
      ...baseInsights,
      { type: 'Legal', level: 'Medium', text: 'Definition of confidential information could be more specific', color: 'yellow' },
      { type: 'Risk', level: 'High', text: 'No carve-outs for publicly available information', color: 'red' },
      { type: 'Compliance', level: 'Low', text: 'Return/destruction clause is properly defined', color: 'green' },
      { type: 'Suggestion', level: 'Low', text: 'Consider adding exceptions for independently developed information', color: 'green' },
      { type: 'Legal', level: 'Medium', text: 'Remedy clause may be too broad - consider limiting scope', color: 'yellow' },
      { type: 'Standard', level: 'Low', text: 'Governing law clause follows Delaware standards', color: 'green' }
    ];

    return expanded ? expandedInsights : baseInsights;
  };

  // Show component loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-gray-100/10 dark:border-gray-700/10 bg-purple-50/10 dark:bg-purple-900/10">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="md" text="Loading insights..." />
        </div>
      </div>
    );
  }
  
  const getColorClasses = (color: string, level: string) => {
    const colorMap = {
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        chip: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        levelChip: level === 'High' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        chip: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        levelChip: level === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        chip: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        levelChip: level === 'Low' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        chip: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        levelChip: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
      }
    };
    
    // Return the color mapping or fallback to gray
    return colorMap[color as keyof typeof colorMap] || {
      bg: 'bg-gray-50 dark:bg-gray-900/20',
      border: 'border-gray-200 dark:border-gray-800',
      chip: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200',
      levelChip: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200'
    };
  };
  
  return (
    <div className="h-full flex flex-col bg-white/15 dark:bg-gray-900/15 rounded-lg shadow-lg border-2 border-white/30 dark:border-gray-600/40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100/10 dark:border-gray-700/10 bg-purple-50/10 dark:bg-purple-900/10">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
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
            className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-purple-700 dark:text-purple-300" /> : <Maximize2 className="w-4 h-4 text-purple-700 dark:text-purple-300" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {isDataLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <LoadingSpinner size="md" text={`Fetching insights from ${apiMode === 'real' ? 'server' : 'API'}...`} />
            {apiMode === 'real' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                AI is analyzing your document<br />This may take a few moments
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {(expanded ? insights : insights.slice(0, 4)).map((insight, index) => {
              const colors = getColorClasses(insight.color || 'gray', insight.level || 'Medium');
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-lg bg-white/10 dark:bg-gray-900/10 border-white/20 dark:border-gray-700/20`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.chip}`}>
                      {insight.type || 'Info'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.levelChip}`}>
                      {insight.level || 'Medium'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insight.text || 'No description available'}
                  </p>
                </div>
              );
            })}
            
            {apiMode === 'real' && insights.length === 0 && !isDataLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No insights available yet. Upload a document to get AI-powered analysis.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPanel;