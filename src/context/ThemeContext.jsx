import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'

const ThemeContext = createContext({})

export function useThemeSettings() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('documint:theme')
      if (saved === 'dark' || saved === 'light') setMode(saved)
    } catch (e) {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('documint:theme', mode)
    } catch (e) {}
  }, [mode])

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'))

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1a73e8' : '#8ab4f8',
        light: mode === 'light' ? '#4285f4' : '#aecbfa',
        dark: mode === 'light' ? '#1557b0' : '#669df6',
        contrastText: '#fff',
      },
      secondary: {
        main: mode === 'light' ? '#5f6368' : '#9aa0a6',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#202124',
        paper: mode === 'light' ? '#ffffff' : '#292a2d',
      },
      text: {
        primary: mode === 'light' ? '#202124' : '#e8eaed',
        secondary: mode === 'light' ? '#5f6368' : '#9aa0a6',
      },
      divider: mode === 'light' ? '#e8eaed' : '#3c4043',
      grey: {
        50: '#f8f9fa',
        100: '#f1f3f4',
        200: '#e8eaed',
        300: '#dadce0',
        400: '#bdc1c6',
        500: '#9aa0a6',
        600: '#80868b',
        700: '#5f6368',
        800: '#3c4043',
        900: '#202124',
      },
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2rem',
        fontWeight: 500,
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
      },
      h2: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.33,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.6,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.8125rem',
        fontWeight: 400,
        lineHeight: 1.5,
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none',
        letterSpacing: '0.01em',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.03em',
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#292a2d',
            color: mode === 'light' ? '#202124' : '#e8eaed',
            boxShadow: 'none',
            borderBottom: `1px solid ${mode === 'light' ? '#e8eaed' : '#3c4043'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: 'none',
            border: `1px solid ${mode === 'light' ? '#e8eaed' : '#3c4043'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            '&:hover': {
              backgroundColor: mode === 'light' ? '#f1f3f4' : '#3c4043',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: 'none',
            border: `1px solid ${mode === 'light' ? '#e8eaed' : '#3c4043'}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              '& fieldset': {
                borderColor: mode === 'light' ? '#dadce0' : '#5f6368',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#bdc1c6' : '#80868b',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  }), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return useContext(ThemeContext)
}
