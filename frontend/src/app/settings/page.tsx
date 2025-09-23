'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';
import AuthGuard from '@/components/AuthGuard';
import { checkBackendHealth } from '@/lib/api';
import { Settings as SettingsIcon, Server, Info, Trash2, CheckCircle, XCircle, Loader2, BookOpen } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [backendHealth, setBackendHealth] = useState<'checking' | 'healthy' | 'unhealthy' | null>(null);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      // Check if mock mode is forced by environment
      const forceMockMode = process.env.NEXT_PUBLIC_FORCE_MOCK_MODE === 'true';
      setMockMode(forceMockMode);
      
      // Check backend health
      setBackendHealth('checking');
      checkHealth();
      setIsLoading(false);
    };
    
    loadSettings();
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

  const clearStoredData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentDocument');
      localStorage.removeItem('uploadHistory');
      localStorage.removeItem('apiMode');
      localStorage.removeItem('detectedApiMode');
      alert('All stored data has been cleared.');
    }
  };

  if (isLoading) {
    return <PageLoader text="Loading settings..." />;
  }

  return (
    <AuthGuard>
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
            {/* Backend Status */}
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Backend Status
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                {mockMode ? 
                  'Mock mode is enabled via environment configuration.' :
                  'Application is connected to the real FastAPI backend for document processing.'
                }
              </p>

              <div className="space-y-3 sm:space-y-4">
                {mockMode ? (
                  <div className="p-3 sm:p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                        Mock Mode Active
                      </span>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Using simulated responses for demonstration. To use real backend processing, 
                      set NEXT_PUBLIC_FORCE_MOCK_MODE=false in your .env.local file.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        Real Backend Mode
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Connected to FastAPI backend for real document processing and AI analysis.
                    </p>
                    
                    {/* Backend Health Status */}
                    <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
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
                              Backend is running and healthy
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
                        <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                          Make sure your FastAPI backend is running on the expected URL.
                        </p>
                      )}
                      <button
                        onClick={checkHealth}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Recheck status
                      </button>
                    </div>
                    
                    {backendHealth === 'healthy' && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-green-800 dark:text-green-200">
                            <p className="font-medium mb-1">Backend Connected</p>
                            <p>
                              All backend endpoints are accessible and ready for document processing.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

            {/* Documentation */}
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Documentation & Help
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                Learn more about {process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'} features, technical specifications, and roadmap.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <button
                  onClick={() => router.push('/docs')}
                  className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center sm:justify-start text-sm sm:text-base"
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  View Documentation
                </button>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Access comprehensive guides, feature specifications, and development roadmap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </AuthGuard>
  );
}