'use client';

import React from 'react';
import Layout from '@/components/Layout';
import DocumentUpload from '@/components/DocumentUpload';

export default function UploadPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Legal Document
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get instant AI-powered insights on your legal documents. Upload contracts, 
              agreements, and other legal documents for comprehensive analysis.
            </p>
          </div>

          {/* Upload Component */}
          <DocumentUpload />

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                AI Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced AI scans your document for risks, compliance issues, and provides actionable insights.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Q&A Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ask questions about your document and get instant, accurate answers powered by AI.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
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
  );
}