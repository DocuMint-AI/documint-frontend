'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';
import DocumentUpload from '@/components/DocumentUpload';
import AuthGuard from '@/components/AuthGuard';
import { Search, MessageSquare, BarChart3 } from 'lucide-react';

export default function UploadPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for page setup
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader text="Loading upload page..." />;
  }
  
  return (
    <AuthGuard>
      <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-black py-6 sm:py-8 lg:py-12 stars-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Upload Legal Document
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2 sm:px-0">
              Get instant AI-powered insights on your legal documents. Upload contracts, 
              agreements, and other legal documents for comprehensive analysis.
            </p>
          </div>

          {/* Upload Component */}
          <DocumentUpload />

          {/* Features */}
          <div className="mt-12 sm:mt-14 lg:mt-16 grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="text-center px-4 sm:px-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced AI scans your document for risks, compliance issues, and provides actionable insights.
              </p>
            </div>

            <div className="text-center px-4 sm:px-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Q&A Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions about your document and get instant, accurate answers powered by AI.
              </p>
            </div>

            <div className="text-center px-4 sm:px-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Risk Assessment
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get comprehensive risk scores and compliance ratings for your legal documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </AuthGuard>
  );
}