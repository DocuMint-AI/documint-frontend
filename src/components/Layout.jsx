import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useThemeContext } from '../context/ThemeContext'
import Link from 'next/link'

export default function Layout({ children }) {
  const { mode, toggleMode } = useThemeContext()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="sticky" color="inherit" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth={false}>
          <Toolbar disableGutters>
            <Typography variant="h6" sx={{ mr: 3 }}>
              <Link href="/">DocuMint</Link>
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Link href="/settings">Settings</Link>
              <IconButton onClick={toggleMode} color="inherit" aria-label="Toggle theme">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main">{children}</Box>
    </Box>
  )
}
