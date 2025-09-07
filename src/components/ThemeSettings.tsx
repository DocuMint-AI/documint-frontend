import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Typography,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Settings, Palette, Monitor, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMaterial3Theme, type AccentColor, type ThemeMode } from '../theme/Material3ThemeProvider';

interface ThemeSettingsProps {
  open: boolean;
  onClose: () => void;
}

const ACCENT_COLORS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: '#1976d2' },
  { value: 'green', label: 'Green', color: '#2e7d32' },
  { value: 'purple', label: 'Purple', color: '#7b1fa2' },
  { value: 'orange', label: 'Orange', color: '#f57c00' },
  { value: 'red', label: 'Red', color: '#d32f2f' },
  { value: 'teal', label: 'Teal', color: '#00695c' },
];

const THEME_MODES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'auto', label: 'Auto', icon: <Monitor size={16} /> },
];

export function ThemeSettings({ open, onClose }: ThemeSettingsProps) {
  const theme = useTheme();
  const { mode, accentColor, setMode, setAccentColor } = useMaterial3Theme();

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
            }}
            onClick={onClose}
          />
          
          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              width: '90%',
              maxWidth: '400px',
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: theme.shadows[8],
              }}
            >
              <CardHeader
                avatar={
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                    }}
                  >
                    <Settings size={20} />
                  </Box>
                }
                title={
                  <Typography variant="h6" fontWeight={600}>
                    Theme Settings
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" color="text.secondary">
                    Customize your Material You experience
                  </Typography>
                }
              />
              
              <CardContent sx={{ pt: 0 }}>
                <Box sx={{ mb: 3 }}>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel 
                      component="legend" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                      }}
                    >
                      Theme Mode
                    </FormLabel>
                    <RadioGroup
                      value={mode}
                      onChange={(e) => setMode(e.target.value as ThemeMode)}
                      sx={{ gap: 1 }}
                    >
                      {THEME_MODES.map((themeMode) => (
                        <FormControlLabel
                          key={themeMode.value}
                          value={themeMode.value}
                          control={<Radio size="small" />}
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              {themeMode.icon}
                              <Typography variant="body2">
                                {themeMode.label}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            p: 1,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover,
                            },
                            ...(mode === themeMode.value && {
                              backgroundColor: theme.palette.primary.main + '10',
                              borderColor: theme.palette.primary.main,
                            }),
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>
                
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Palette size={16} />
                    Accent Color
                  </Typography>
                  
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 1,
                    }}
                  >
                    {ACCENT_COLORS.map((color) => (
                      <Tooltip key={color.value} title={color.label}>
                        <Box
                          component="button"
                          onClick={() => setAccentColor(color.value)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `2px solid ${
                              accentColor === color.value 
                                ? color.color 
                                : theme.palette.divider
                            }`,
                            backgroundColor: 
                              accentColor === color.value 
                                ? color.color + '15' 
                                : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            '&:hover': {
                              backgroundColor: color.color + '10',
                              borderColor: color.color,
                            },
                          }}
                          aria-label={`Select ${color.label} accent color`}
                          role="radio"
                          aria-checked={accentColor === color.value}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: color.color,
                            }}
                          />
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {color.label}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Settings are automatically saved
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ThemeSettings;