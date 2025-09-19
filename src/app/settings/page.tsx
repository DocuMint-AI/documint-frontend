'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { getApiMode, setApiMode } from '@/lib/api';
import { Settings as SettingsIcon, Server, Cloud, Info, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [apiMode, setCurrentApiMode] = useState<'mock' | 'real'>('mock');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentApiMode(getApiMode());
    setIsLoading(false);
  }, []);

  const handleApiModeChange = (mode: 'mock' | 'real') => {
    setCurrentApiMode(mode);
    setApiMode(mode);
  };

  const clearStoredData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentDocument');
      localStorage.removeItem('uploadHistory');
      alert('All stored data has been cleared.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <SettingsIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your DocuMint AI experience and API preferences.
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* API Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                API Configuration
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose between mock API for demonstration or connect to a real FastAPI backend.
              </p>

              <div className="space-y-4">
                {/* Mock API Option */}
                <label className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="apiMode"
                    value="mock"
                    checked={apiMode === 'mock'}
                    onChange={() => handleApiModeChange('mock')}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Mock API (Demo Mode)
                      </span>
                      {apiMode === 'mock' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Uses simulated responses for demonstration purposes. No real document processing occurs.
                      Perfect for testing the interface without a backend server.
                    </p>
                    <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <li>• Instant responses with sample data</li>
                      <li>• No external dependencies required</li>
                      <li>• Safe for development and testing</li>
                    </ul>
                  </div>
                </label>

                {/* Real API Option */}
                <label className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="apiMode"
                    value="real"
                    checked={apiMode === 'real'}
                    onChange={() => handleApiModeChange('real')}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        Real FastAPI Backend
                      </span>
                      {apiMode === 'real' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connects to a live FastAPI backend for real document processing and AI analysis.
                      Requires a running backend server.
                    </p>
                    <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <li>• Real AI-powered document analysis</li>
                      <li>• Actual file processing and storage</li>
                      <li>• Requires backend server setup</li>
                    </ul>
                    {apiMode === 'real' && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <p className="font-medium mb-1">Backend Required</p>
                            <p>
                              Make sure your FastAPI backend is running on the expected endpoints:
                            </p>
                            <ul className="mt-1 space-y-1 text-xs">
                              <li>• POST /api/upload</li>
                              <li>• POST /api/v1/process-document</li>
                              <li>• POST /api/v1/qa</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Data Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Manage your locally stored data and preferences.
              </p>

              <div className="space-y-4">
                <button
                  onClick={clearStoredData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Stored Data
                </button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This will remove all locally stored documents, analysis results, and user preferences.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About DocuMint AI
              </h2>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  DocuMint AI is a powerful legal document analysis platform built with Next.js 14, 
                  featuring AI-powered insights, risk assessment, and interactive Q&A capabilities.
                </p>
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Frontend Technologies
                    </h4>
                    <ul className="space-y-1">
                      <li>• Next.js 14 with App Router</li>
                      <li>• React 18 with TypeScript</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• Lucide React for icons</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Key Features
                    </h4>
                    <ul className="space-y-1">
                      <li>• AI-powered document analysis</li>
                      <li>• Risk and compliance scoring</li>
                      <li>• Interactive Q&A assistant</li>
                      <li>• Responsive panel layout</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}