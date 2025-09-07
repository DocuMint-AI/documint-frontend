import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Material3ThemeProvider } from './src/theme/Material3ThemeProvider';
import { PanelProvider } from './src/context/PanelContext';
import Header from './src/components/Header';
import ResponsiveLayout from './src/components/ResponsiveLayout';

/**
 * Legal Document AI Interface
 * 
 * A comprehensive AI-powered legal document analysis interface featuring:
 * - Material 3 (Material You) theming with dynamic color schemes
 * - Resizable panels with smooth animations and touch support
 * - Responsive design that adapts to mobile, tablet, and desktop
 * - Accessibility features including ARIA roles and keyboard navigation
 * - Persistent state management with localStorage
 * 
 * @component
 */
export default function LegalDocumentAIInterface() {
  return (
    <Material3ThemeProvider>
      <CssBaseline />
      <PanelProvider>
        <Box 
          sx={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header with theme controls and navigation */}
          <Header />
          
          {/* Main panel layout */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <ResponsiveLayout />
          </Box>
        </Box>
      </PanelProvider>
    </Material3ThemeProvider>
  );
}