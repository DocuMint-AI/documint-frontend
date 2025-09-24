'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Lightbulb } from 'lucide-react';
import { uploadDocument, processDocument, getDocumentText } from '@/lib/api';

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
  const [showOcrWarning, setShowOcrWarning] = useState(false);
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
        
        // Fetch document text from backend - TEMPORARILY DISABLED
        // const textResult = await getDocumentText(uploadResult.documentId);
        console.log('Vision OCR backend call temporarily disabled due to bug. Document ID:', uploadResult.documentId);
        
        // Simulate failed text extraction to trigger OCR warning
        const textResult = { 
          success: false, 
          text: '', 
          error: 'Vision OCR temporarily disabled',
          filename: uploadResult.filename,
          word_count: 0,
          page_count: 0
        };
        
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
            // Store current document with analysis
            localStorage.setItem('currentDocument', JSON.stringify({
              id: uploadResult.documentId,
              filename: uploadResult.filename,
              analysis: processResult.analysis
            }));
            
            // Store document text separately if available
            if (textResult.success) {
              // Check if extracted text is empty or minimal
              if (!textResult.text || textResult.text.trim().length < 10) {
                setShowOcrWarning(true);
                console.log('OCR Warning: Minimal or no text extracted from document');
              }
              localStorage.setItem(`document_${uploadResult.documentId}`, JSON.stringify({
                text: textResult.text,
                filename: textResult.filename || uploadResult.filename,
                wordCount: textResult.word_count,
                pageCount: textResult.page_count
              }));
            } else {
              setShowOcrWarning(true);
              console.log('OCR Warning: Vision OCR backend call failed or disabled:', textResult.error || 'No text extracted');
              // Store empty document data when OCR fails
              localStorage.setItem(`document_${uploadResult.documentId}`, JSON.stringify({
                text: '',
                filename: uploadResult.filename,
                wordCount: 0,
                pageCount: 0
              }));
            }
            
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
    setShowOcrWarning(false);
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
    return 'Upload a PDF file to analyze - other formats coming soon';
  };

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      {/* OCR Warning */}
      {showOcrWarning && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                Vision OCR Issue Detected
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Vision OCR work is currently bugged and fix is in progress. Please upload a PDF with clear, scannable text for best results.
              </p>
            </div>
          </div>
        </div>
      )}
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
              Supported formats: PDF • Max size: {Math.floor((parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760') / (1024 * 1024)))}MB
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