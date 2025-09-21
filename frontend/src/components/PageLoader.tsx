'use client';

import React from 'react';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
  showLayout?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  text = 'Loading page...', 
  showLayout = true 
}) => {
  const content = (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );

  if (showLayout) {
    return <Layout>{content}</Layout>;
  }

  return content;
};

export default PageLoader;