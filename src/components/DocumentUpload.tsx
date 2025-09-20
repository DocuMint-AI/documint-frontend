'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Lightbulb } from 'lucide-react';
import { uploadDocument, processDocument } from '@/lib/api';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadedFile(file);

    try {
      const uploadResult = await uploadDocument(file);
      
      if (uploadResult.success) {
        setUploadStatus('success');
        setStatusMessage(`Successfully uploaded ${uploadResult.filename}`);
        
        // Start processing the document
        setIsProcessing(true);
        
        // Set processing flag for workspace loading state
        if (typeof window !== 'undefined') {
          localStorage.setItem('processingDocument', 'true');
        }
        
        const processResult = await processDocument(uploadResult.documentId);
        
        if (processResult.success) {
          setStatusMessage(`Document processed successfully. Redirecting to workspace...`);
          
          // Store document data for workspace and clear processing flag
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentDocument', JSON.stringify({
              id: uploadResult.documentId,
              filename: uploadResult.filename,
              analysis: processResult.analysis
            }));
            // Store upload timestamp for metadata display
            localStorage.setItem(`document_${uploadResult.documentId}_uploaded`, new Date().toISOString());
            localStorage.removeItem('processingDocument');
          }
          
          // Redirect to workspace after a brief delay
          setTimeout(() => {
            if (onUploadComplete) {
              onUploadComplete(uploadResult.documentId);
            } else {
              router.push('/workspace');
            }
          }, 1500);
        } else {
          setUploadStatus('error');
          setStatusMessage(processResult.error || 'Failed to process document');
          // Clear processing flag on error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('processingDocument');
          }
        }
      } else {
        setUploadStatus('error');
        setStatusMessage(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      // Clear processing flag on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('processingDocument');
      }
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadStatus('idle');
    setStatusMessage('');
    setUploadedFile(null);
    setIsUploading(false);
    setIsProcessing(false);
  };

  const getStatusIcon = () => {
    if (isUploading || isProcessing) {
      return <Loader2 className="w-8 h-8 animate-spin text-blue-500" />;
    }
    if (uploadStatus === 'success') {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
    if (uploadStatus === 'error') {
      return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
    return <Upload className="w-8 h-8 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isProcessing) {
      return 'Processing document with AI...';
    }
    if (isUploading) {
      return 'Uploading document...';
    }
    if (statusMessage) {
      return statusMessage;
    }
    return 'Upload a PDF or DOCX file to analyze';
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <div
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-6 lg:p-8 text-center min-h-[280px] sm:min-h-[320px] flex flex-col items-center justify-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
            : uploadStatus === 'success'
            ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Upload icon and status */}
        <div className="mb-4">
          {getStatusIcon()}
        </div>

        {/* Main text */}
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 px-2">
          {getStatusText()}
        </h3>

        {/* File info */}
        {uploadedFile && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {uploadedFile.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>
        )}

        {/* Instructions */}
        {uploadStatus === 'idle' && !isUploading && (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 px-2 text-sm sm:text-base">
              Drag and drop your document here, or click to browse
            </p>

            <input
              type="file"
              accept={process.env.NEXT_PUBLIC_SUPPORTED_FORMATS || '.pdf,.doc,.docx'}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm sm:text-base"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </label>

            <div className="mt-3 sm:mt-4 text-xs text-gray-500 dark:text-gray-400 px-2">
              Supported formats: {(process.env.NEXT_PUBLIC_SUPPORTED_FORMATS || '.pdf,.doc,.docx').replace(/\./g, '').toUpperCase()} • Max size: {Math.floor((parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760') / (1024 * 1024)))}MB
            </div>
          </>
        )}

        {/* Actions for completed upload */}
        {(uploadStatus === 'success' || uploadStatus === 'error') && !isProcessing && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center w-full max-w-xs">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 text-sm sm:text-base"
            >
              Upload Another
            </button>
            {uploadStatus === 'success' && (
              <button
                onClick={() => router.push('/workspace')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Go to Workspace
              </button>
            )}
          </div>
        )}

        {/* Progress indicator */}
        {(isUploading || isProcessing) && (
          <div className="mt-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isProcessing ? 'bg-purple-500' : 'bg-blue-500'
                }`}
                style={{
                  width: isUploading ? '50%' : isProcessing ? '90%' : '0%'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-semibold text-blue-900 dark:text-blue-300">
            Tips for better analysis
          </h4>
        </div>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Ensure your document text is selectable (not scanned images)</li>
          <li>• Legal contracts and agreements work best</li>
          <li>• Longer documents provide more comprehensive insights</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;