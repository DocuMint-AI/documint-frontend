'use client';

import { useEffect } from 'react';

// This component silently initializes the API mode detection
// It runs in the background to determine if the real backend is available
const ApiInitializer = () => {
  useEffect(() => {
    // Import the initialization function and run it
    const initializeApi = async () => {
      try {
        // Dynamic import to ensure it only runs on client side
        const { getApiMode } = await import('@/lib/api');
        
        // Trigger the initialization by calling getApiMode
        // This will automatically detect the backend and set the mode
        await getApiMode();
      } catch (error) {
        console.log('API initialization error:', error);
      }
    };

    // Run initialization after a short delay to not block rendering
    const timer = setTimeout(initializeApi, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // This component renders nothing but runs the initialization
  return null;
};

export default ApiInitializer;