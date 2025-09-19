'use client';

import React from 'react';
import { Maximize2, Minimize2, Brain, Minus } from 'lucide-react';

interface InsightsPanelProps {
  expanded: boolean;
  onExpand: () => void;
  onMinimize: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ expanded, onExpand, onMinimize }) => {
  const baseInsights = [
    { type: 'Risk', level: 'High', text: 'Overly broad confidentiality scope may be unenforceable', color: 'red' },
    { type: 'Compliance', level: 'Medium', text: 'Missing jurisdiction clause for dispute resolution', color: 'yellow' },
    { type: 'Standard', level: 'Low', text: 'Term length aligns with industry standards', color: 'green' },
    { type: 'Suggestion', level: 'Medium', text: 'Consider adding mutual confidentiality provisions', color: 'yellow' }
  ];

  const expandedInsights = [
    ...baseInsights,
    { type: 'Legal', level: 'Medium', text: 'Definition of confidential information could be more specific', color: 'yellow' },
    { type: 'Risk', level: 'High', text: 'No carve-outs for publicly available information', color: 'red' },
    { type: 'Compliance', level: 'Low', text: 'Return/destruction clause is properly defined', color: 'green' },
    { type: 'Suggestion', level: 'Low', text: 'Consider adding exceptions for independently developed information', color: 'green' },
    { type: 'Legal', level: 'Medium', text: 'Remedy clause may be too broad - consider limiting scope', color: 'yellow' },
    { type: 'Standard', level: 'Low', text: 'Governing law clause follows Delaware standards', color: 'green' }
  ];

  const insights = expanded ? expandedInsights : baseInsights;
  
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
      }
    };
    return colorMap[color as keyof typeof colorMap];
  };
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-600 bg-purple-50/30 dark:bg-purple-900/30">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
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
            className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-800 dark:hover:bg-purple-700 transition-colors duration-200"
            aria-label={expanded ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {expanded ? <Minimize2 className="w-4 h-4 text-purple-700 dark:text-purple-300" /> : <Maximize2 className="w-4 h-4 text-purple-700 dark:text-purple-300" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const colors = getColorClasses(insight.color, insight.level);
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-200 hover:shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.chip}`}>
                    {insight.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.levelChip}`}>
                    {insight.level}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {insight.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;