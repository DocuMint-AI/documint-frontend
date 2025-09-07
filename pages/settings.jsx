import React, { useState, useEffect } from 'react'
import Layout from '../src/components/Layout'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import { alpha, useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import SettingsIcon from '@mui/icons-material/Settings'
import PaletteIcon from '@mui/icons-material/Palette'
import LanguageIcon from '@mui/icons-material/Language'
import AccessibilityIcon from '@mui/icons-material/Accessibility'
import SecurityIcon from '@mui/icons-material/Security'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckIcon from '@mui/icons-material/Check'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import AutoModeIcon from '@mui/icons-material/AutoMode'
import { useThemeContext } from '../src/context/ThemeContext'
import { useDocument } from '../src/context/DocumentContext'

const MotionCard = motion(Card)
const MotionBox = motion(Box)

const accentColors = [
  { name: 'Blue', value: '#1976d2', description: 'Classic and professional' },
  { name: 'Green', value: '#2e7d32', description: 'Natural and calming' },
  { name: 'Purple', value: '#7b1fa2', description: 'Creative and modern' },
  { name: 'Orange', value: '#f57c00', description: 'Energetic and warm' },
  { name: 'Red', value: '#d32f2f', description: 'Bold and assertive' },
  { name: 'Teal', value: '#00796b', description: 'Sophisticated and unique' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

export default function Settings() {
  const theme = useTheme()
  const { mode, toggleMode, accentColor, setAccentColor } = useThemeContext()
  const { availableModels, currentModel, loading, fetchAvailableModels, selectModel } = useDocument()
  const [selectedModel, setSelectedModel] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    setSelectedModel(currentModel)
  }, [currentModel])

  const handleModelChange = async (event) => {
    const newModel = event.target.value
    setSelectedModel(newModel)
    
    const result = await selectModel(newModel)
    if (result.success) {
      setSnackbar({
        open: true,
        message: `Successfully switched to ${newModel}`,
        severity: 'success'
      })
    } else {
      setSnackbar({
        open: true,
        message: `Failed to switch model: ${result.error}`,
        severity: 'error'
      })
      // Revert selection on failure
      setSelectedModel(currentModel)
    }
  }

  const handleRefreshModels = async () => {
    await fetchAvailableModels()
    setSnackbar({
      open: true,
      message: 'Models list refreshed',
      severity: 'info'
    })
  }

  const handleAccentColorChange = (color) => {
    setAccentColor(color)
    setSnackbar({
      open: true,
      message: `Accent color changed to ${accentColors.find(c => c.value === color)?.name}`,
      severity: 'success'
    })
  }

  const settingsSections = [
    {
      title: 'AI Model',
      icon: SmartToyIcon,
      items: [
        {
          label: 'Current Model',
          description: 'Select the Ollama model to use for document analysis and chat',
          control: (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select 
                  value={selectedModel} 
                  onChange={handleModelChange}
                  disabled={loading}
                  displayEmpty
                  sx={{
                    borderRadius: 3,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider',
                    },
                  }}
                >
                  {availableModels.length === 0 ? (
                    <MenuItem value="" disabled>
                      No models available
                    </MenuItem>
                  ) : (
                    availableModels.map((model) => (
                      <MenuItem key={model.name} value={model.name}>
                        <Box>
                          <Typography variant="bodyMedium" sx={{ fontWeight: 500 }}>
                            {model.name}
                          </Typography>
                          <Typography variant="labelSmall" color="text.secondary">
                            {model.size ? `${(model.size / 1024 / 1024 / 1024).toFixed(1)} GB` : 'Size unknown'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <IconButton
                onClick={handleRefreshModels}
                disabled={loading}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Box>
          )
        }
      ]
    },
    {
      title: 'Appearance',
      icon: PaletteIcon,
      items: [
        {
          label: 'Theme Mode',
          description: 'Choose your preferred color scheme',
          control: (
            <ButtonGroup variant="outlined" size="small">
              <Button
                startIcon={<LightModeIcon />}
                variant={mode === 'light' ? 'contained' : 'outlined'}
                onClick={() => mode !== 'light' && toggleMode()}
                sx={{ borderRadius: '12px 0 0 12px' }}
              >
                Light
              </Button>
              <Button
                startIcon={<DarkModeIcon />}
                variant={mode === 'dark' ? 'contained' : 'outlined'}
                onClick={() => mode !== 'dark' && toggleMode()}
                sx={{ borderRadius: '0 12px 12px 0' }}
              >
                Dark
              </Button>
            </ButtonGroup>
          )
        },
        {
          label: 'Accent Color',
          description: 'Choose your preferred accent color for the interface',
          control: (
            <Grid container spacing={1} sx={{ maxWidth: 300 }}>
              {accentColors.map((color) => (
                <Grid item key={color.value}>
                  <IconButton
                    onClick={() => handleAccentColorChange(color.value)}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: color.value,
                      border: `2px solid ${accentColor === color.value ? 'white' : 'transparent'}`,
                      boxShadow: accentColor === color.value ? 
                        `0 0 0 2px ${color.value}` : 
                        `0 2px 8px ${alpha(color.value, 0.3)}`,
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: `0 4px 12px ${alpha(color.value, 0.4)}`,
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    title={`${color.name} - ${color.description}`}
                  >
                    {accentColor === color.value && (
                      <CheckIcon sx={{ color: 'white', fontSize: 20 }} />
                    )}
                  </IconButton>
                </Grid>
              ))}
            </Grid>
          )
        }
      ]
    },
    {
      title: 'Language & Region',
      icon: LanguageIcon,
      items: [
        {
          label: 'Language',
          description: 'Choose your preferred language',
          control: (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select 
                value="en" 
                disabled
                sx={{
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          )
        }
      ]
    },
    {
      title: 'Accessibility',
      icon: AccessibilityIcon,
      items: [
        {
          label: 'High Contrast',
          description: 'Increase contrast for better visibility',
          control: (
            <Switch 
              disabled
              inputProps={{ 'aria-label': 'Toggle high contrast' }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
          )
        },
        {
          label: 'Large Text',
          description: 'Increase font size throughout the app',
          control: (
            <Switch 
              disabled
              inputProps={{ 'aria-label': 'Toggle large text' }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
          )
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: SecurityIcon,
      items: [
        {
          label: 'Auto-delete uploads',
          description: 'Automatically delete uploaded files after analysis',
          control: (
            <Switch 
              defaultChecked
              disabled
              inputProps={{ 'aria-label': 'Toggle auto-delete' }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'primary.main',
                },
              }}
            />
          )
        }
      ]
    }
  ]

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        {/* Header */}
        <MotionBox 
          sx={{ mb: 6 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <SettingsIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="displaySmall" sx={{ fontWeight: 400, mb: 1 }}>
                Settings
              </Typography>
              <Typography variant="bodyLarge" color="text.secondary">
                Customize your DocuMint experience
              </Typography>
            </Box>
          </Box>
        </MotionBox>

        {/* Settings Cards */}
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {settingsSections.map((section, sectionIndex) => {
            const IconComponent = section.icon
            return (
              <MotionCard
                key={sectionIndex}
                variants={cardVariants}
                sx={{ 
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  }
                }} 
                elevation={0}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Section Header */}
                  <Box sx={{ 
                    p: 4, 
                    pb: 3,
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, 0.04)}, 
                      ${alpha(theme.palette.secondary.main, 0.02)}
                    )`,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent sx={{ color: 'primary.main', fontSize: 20 }} />
                      </Box>
                      <Typography variant="titleLarge" sx={{ fontWeight: 500 }}>
                        {section.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'divider' }} />

                  {/* Settings Items */}
                  <List sx={{ py: 0 }}>
                    {section.items.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        <ListItem sx={{ py: 3, px: 4 }}>
                          <ListItemText
                            primary={
                              <Typography variant="bodyLarge" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {item.label}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="bodyMedium" color="text.secondary">
                                {item.description}
                              </Typography>
                            }
                          />
                          <Box sx={{ ml: 3 }}>
                            {item.control}
                          </Box>
                        </ListItem>
                        {itemIndex < section.items.length - 1 && (
                          <Divider variant="inset" sx={{ borderColor: 'divider' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </MotionCard>
            )
          })}
        </MotionBox>

        {/* Footer Note */}
        <MotionBox 
          sx={{ 
            mt: 6, 
            p: 4, 
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
            borderRadius: 4, 
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.secondary.main}
              )`,
            }
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Typography variant="bodyMedium" color="text.secondary" align="center">
            🚧 Some settings are currently in development and will be available in future updates.
          </Typography>
        </MotionBox>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ borderRadius: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  )
}
