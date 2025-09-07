import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  FileText,
  Brain,
  MessageCircle,
  Maximize2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePanelContext, type PanelId } from '../context/PanelContext';

const getPanelIcon = (panelId: PanelId) => {
  switch (panelId) {
    case 'document': return FileText;
    case 'insights': return Brain;
    case 'qa': return MessageCircle;
    default: return FileText;
  }
};

const getPanelTitle = (panelId: PanelId) => {
  switch (panelId) {
    case 'document': return 'Document';
    case 'insights': return 'AI Insights';
    case 'qa': return 'Q&A Assistant';
    default: return 'Panel';
  }
};

const getPanelColor = (panelId: PanelId, theme: any) => {
  switch (panelId) {
    case 'document': return theme.palette.primary.main;
    case 'insights': return theme.palette.secondary.main;
    case 'qa': return (theme.palette as any).tertiary?.main || theme.palette.info.main;
    default: return theme.palette.primary.main;
  }
};

export function MinimizedPanelBar() {
  const theme = useTheme();
  const { 
    getMinimizedPanels, 
    expandPanel, 
    restorePanel,
    restoreAllPanels 
  } = usePanelContext();
  
  const minimizedPanels = getMinimizedPanels();

  if (minimizedPanels.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mx: 2,
            mb: 2,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
          >
            {/* Minimized panels */}
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mr: 1, fontSize: '0.8rem' }}
              >
                Minimized:
              </Typography>
              
              {minimizedPanels.map((panel) => {
                const IconComponent = getPanelIcon(panel.id);
                const panelColor = getPanelColor(panel.id, theme);
                
                return (
                  <motion.div
                    key={panel.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Chip
                      icon={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: panelColor,
                          }}
                        >
                          <IconComponent size={14} />
                        </Box>
                      }
                      label={getPanelTitle(panel.id)}
                      variant="outlined"
                      size="small"
                      onClick={() => restorePanel(panel.id)}
                      sx={{
                        borderColor: alpha(panelColor, 0.3),
                        backgroundColor: alpha(panelColor, 0.05),
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(panelColor, 0.1),
                          borderColor: alpha(panelColor, 0.5),
                          transform: 'scale(1.05)',
                        },
                        '& .MuiChip-label': {
                          fontSize: '0.75rem',
                          fontWeight: 500,
                        },
                      }}
                    />
                  </motion.div>
                );
              })}
            </Box>

            {/* Action buttons */}
            <Box display="flex" alignItems="center" gap={1}>
              {minimizedPanels.length > 1 && (
                <IconButton
                  size="small"
                  onClick={restoreAllPanels}
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    },
                  }}
                  aria-label="Restore all panels"
                >
                  <Maximize2 size={16} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
}

export default MinimizedPanelBar;