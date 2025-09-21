// Debug utility to check API mode and backend connectivity
import { getApiMode, checkBackendHealth } from './api';

export const debugApiMode = async () => {
  console.log('=== API Mode Debug ===');
  
  // Check manual mode setting
  const manualMode = typeof window !== 'undefined' ? localStorage.getItem('apiMode') : null;
  console.log('Manual API mode setting:', manualMode);
  
  // Check detected mode
  const detectedMode = typeof window !== 'undefined' ? localStorage.getItem('detectedApiMode') : null;
  console.log('Detected API mode:', detectedMode);
  
  // Check current mode
  const currentMode = await getApiMode();
  console.log('Current API mode:', currentMode);
  
  // Check backend health
  try {
    const isHealthy = await checkBackendHealth();
    console.log('Backend health check result:', isHealthy);
  } catch (error) {
    console.log('Backend health check failed:', error);
  }
  
  // Check environment variables
  console.log('Backend base URL:', process.env.NEXT_PUBLIC_BACKEND_BASE_URL);
  console.log('Process endpoint:', process.env.NEXT_PUBLIC_BACKEND_PROCESS_ENDPOINT);
  console.log('QA endpoint:', process.env.NEXT_PUBLIC_BACKEND_QA_ENDPOINT);
  
  console.log('=== End API Mode Debug ===');
};

export default debugApiMode;