'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';
import { getApiMode, setApiMode, checkBackendHealth } from '@/lib/api';
import { Settings as SettingsIcon, Server, Cloud, Info, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [apiMode, setCurrentApiMode] = useState<'mock' | 'real'>('mock');
  const [isLoading, setIsLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<'checking' | 'healthy' | 'unhealthy' | null>(null);
  const [showHealthCheck, setShowHealthCheck] = useState(false);

  useEffect(() => {
    const loadApiMode = async () => {
      const mode = await getApiMode();
      setCurrentApiMode(mode);
      setIsLoading(false);
      
      // Show health check if real mode is selected
      if (mode === 'real') {
        setShowHealthCheck(true);
        checkHealth();
      }
    };
    
    loadApiMode();
  }, []);

  const checkHealth = async () => {
    setBackendHealth('checking');
    try {
      const isHealthy = await checkBackendHealth();
      setBackendHealth(isHealthy ? 'healthy' : 'unhealthy');
    } catch (error) {
      setBackendHealth('unhealthy');
    }
  };

  const handleApiModeChange = (mode: 'mock' | 'real') => {
    setCurrentApiMode(mode);
    setApiMode(mode);
    
    // Show health check when switching to real mode
    if (mode === 'real') {
      setShowHealthCheck(true);
      checkHealth();
    } else {
      setShowHealthCheck(false);
      setBackendHealth(null);
    }
  };

  const clearStoredData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentDocument');
      localStorage.removeItem('uploadHistory');
      alert('All stored data has been cleared.');
    }
  };

  if (isLoading) {
    return <PageLoader text="Loading settings..." />;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-6 sm:py-8 lg:py-12 stars-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <SettingsIcon className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-gray-700 dark:text-gray-300" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Configure your {process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'} experience and API preferences.
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6 sm:space-y-8">
            {/* API Configuration */}
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                API Configuration
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Choose between mock API for demonstration or connect to a real FastAPI backend.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {/* Mock API Option */}
                <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="apiMode"
                    value="mock"
                    checked={apiMode === 'mock'}
                    onChange={() => handleApiModeChange('mock')}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Mock API (Demo Mode)
                        </span>
                      </div>
                      {apiMode === 'mock' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-200 self-start sm:self-auto">
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
                <label className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <input
                    type="radio"
                    name="apiMode"
                    value="real"
                    checked={apiMode === 'real'}
                    onChange={() => handleApiModeChange('real')}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          Real FastAPI Backend
                        </span>
                      </div>
                      {apiMode === 'real' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-200 self-start sm:self-auto">
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
                      <div className="mt-3 space-y-3">
                        {/* Backend Health Status */}
                        {showHealthCheck && (
                          <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              {backendHealth === 'checking' && (
                                <>
                                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Checking backend status...
                                  </span>
                                </>
                              )}
                              {backendHealth === 'healthy' && (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Backend is running
                                  </span>
                                </>
                              )}
                              {backendHealth === 'unhealthy' && (
                                <>
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                    Backend is not accessible
                                  </span>
                                </>
                              )}
                            </div>
                            {backendHealth === 'unhealthy' && (
                              <p className="text-xs text-red-600 dark:text-red-400">
                                Make sure your FastAPI backend is running on the expected URL.
                              </p>
                            )}
                            {backendHealth !== 'checking' && (
                              <button
                                onClick={checkHealth}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                              >
                                Recheck status
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
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
                                <li>• GET /health</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Data Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Manage your locally stored data and preferences.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={clearStoredData}
                  className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto justify-center sm:justify-start text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" />
                  Clear All Stored Data
                </button>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  This will remove all locally stored documents, analysis results, and user preferences.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                About {process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'}
              </h2>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <p>
                  {process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'} is a powerful legal document analysis platform built with Next.js 14, 
                  featuring AI-powered insights, risk assessment, and interactive Q&A capabilities.
                </p>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 pt-3 sm:pt-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                      Frontend Technologies
                    </h4>
                    <ul className="space-y-1 text-xs sm:text-sm">
                      <li>• Next.js 14 with App Router</li>
                      <li>• React 18 with TypeScript</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• Lucide React for icons</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                      Key Features
                    </h4>
                    <ul className="space-y-1 text-xs sm:text-sm">
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