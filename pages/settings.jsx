import React from 'react'
import Layout from '../src/components/Layout'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useThemeContext } from '../src/context/ThemeContext'
import Switch from '@mui/material/Switch'

export default function Settings() {
  const { mode, toggleMode } = useThemeContext()

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Typography>Dark Mode</Typography>
          <Switch checked={mode === 'dark'} onChange={toggleMode} inputProps={{ 'aria-label': 'Toggle dark mode' }} />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Language</Typography>
          <Typography color="textSecondary">Placeholder — add language settings here.</Typography>
        </Box>
      </Container>
    </Layout>
  )
}
