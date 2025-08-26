import React from 'react'
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
import SettingsIcon from '@mui/icons-material/Settings'
import PaletteIcon from '@mui/icons-material/Palette'
import LanguageIcon from '@mui/icons-material/Language'
import AccessibilityIcon from '@mui/icons-material/Accessibility'
import SecurityIcon from '@mui/icons-material/Security'
import { useThemeContext } from '../src/context/ThemeContext'

export default function Settings() {
  const { mode, toggleMode } = useThemeContext()

  const settingsSections = [
    {
      title: 'Appearance',
      icon: PaletteIcon,
      items: [
        {
          label: 'Dark Mode',
          description: 'Switch between light and dark themes',
          control: (
            <Switch 
              checked={mode === 'dark'} 
              onChange={toggleMode} 
              inputProps={{ 'aria-label': 'Toggle dark mode' }}
            />
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
              <Select value="en" disabled>
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
            />
          )
        }
      ]
    }
  ]

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" fontWeight={500}>
              Settings
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Customize your DocuMint experience
          </Typography>
        </Box>

        {/* Settings Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {settingsSections.map((section, sectionIndex) => {
            const IconComponent = section.icon
            return (
              <Card key={sectionIndex} sx={{ borderRadius: 2 }} elevation={2}>
                <CardContent sx={{ p: 0 }}>
                  {/* Section Header */}
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconComponent color="primary" />
                      <Typography variant="h6" fontWeight={500}>
                        {section.title}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Settings Items */}
                  <List sx={{ py: 0 }}>
                    {section.items.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        <ListItem sx={{ py: 2, px: 3 }}>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {item.label}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {item.description}
                              </Typography>
                            }
                          />
                          <Box sx={{ ml: 2 }}>
                            {item.control}
                          </Box>
                        </ListItem>
                        {itemIndex < section.items.length - 1 && <Divider variant="inset" />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )
          })}
        </Box>

        {/* Footer Note */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            🚧 Some settings are currently in development and will be available in future updates.
          </Typography>
        </Box>
      </Container>
    </Layout>
  )
}
