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
      primary: { main: '#0b5fff' },
      background: { default: mode === 'light' ? '#f6f8fb' : '#0b0f14', paper: mode === 'light' ? '#fff' : '#0b1116' }
    },
    shape: { borderRadius: 10 },
    typography: { fontFamily: 'Inter, Roboto, Arial, sans-serif' }
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
