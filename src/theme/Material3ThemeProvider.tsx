import React, { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { 
  createMaterial3Theme, 
  type AccentColor, 
  type ThemeMode, 
  type Material3ThemeConfig 
} from './material3Theme';

interface ThemeContextValue {
  mode: ThemeMode;
  accentColor: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  toggleMode: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface Material3ThemeProviderProps {
  children: ReactNode;
}

export function Material3ThemeProvider({ children }: Material3ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('documint:theme-mode') as ThemeMode;
      const savedAccent = localStorage.getItem('documint:accent-color') as AccentColor;
      
      if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
        setMode(savedMode);
      }
      
      if (savedAccent && ['blue', 'green', 'purple', 'orange', 'red', 'teal'].includes(savedAccent)) {
        setAccentColor(savedAccent);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('documint:theme-mode', mode);
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [mode]);

  useEffect(() => {
    try {
      localStorage.setItem('documint:accent-color', accentColor);
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [accentColor]);

  // Listen to OS theme changes when in auto mode
  useEffect(() => {
    if (mode === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // Force theme recreation by updating a dependency
        setMode('auto');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode]);

  const toggleMode = () => {
    setMode(current => {
      switch (current) {
        case 'light': return 'dark';
        case 'dark': return 'auto';
        case 'auto': return 'light';
        default: return 'light';
      }
    });
  };

  // Determine actual dark mode state
  const isDarkMode = useMemo(() => {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [mode]);

  const theme = useMemo(() => {
    const config: Material3ThemeConfig = {
      mode,
      accentColor,
    };
    return createMaterial3Theme(config);
  }, [mode, accentColor]);

  const contextValue: ThemeContextValue = {
    mode,
    accentColor,
    setMode,
    setAccentColor,
    toggleMode,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useMaterial3Theme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useMaterial3Theme must be used within a Material3ThemeProvider');
  }
  return context;
}

// Export types for convenience
export type { AccentColor, ThemeMode };