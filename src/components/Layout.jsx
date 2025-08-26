import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import DescriptionIcon from '@mui/icons-material/Description'
import { useThemeContext } from '../context/ThemeContext'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }) {
  const { mode, toggleMode } = useThemeContext()
  const router = useRouter()

  const navigationItems = [
    { href: '/', label: 'Upload', active: router.pathname === '/' },
    { href: '/workspace', label: 'Workspace', active: router.pathname === '/workspace' },
    { href: '/settings', label: 'Settings', active: router.pathname === '/settings' },
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={1}>
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
              <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                component={Link}
                href="/"
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                DocuMint
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant={item.active ? 'contained' : 'text'}
                  size="small"
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    color: item.active ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: item.active ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton 
                onClick={toggleMode} 
                color="inherit" 
                aria-label="Toggle theme"
                sx={{ ml: 1 }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
