import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Settings,
  MoreVertical,
  Download,
  Share,
  FileText,
  Palette,
  Keyboard,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMaterial3Theme } from '../theme/Material3ThemeProvider';
import { usePanelContext } from '../context/PanelContext';
import ThemeSettings from './ThemeSettings';

interface HeaderProps {
  onShowKeyboardShortcuts?: () => void;
  onShowHelp?: () => void;
}

export function Header({ onShowKeyboardShortcuts, onShowHelp }: HeaderProps) {
  const theme = useTheme();
  const { toggleMode, accentColor } = useMaterial3Theme();
  const { restoreAllPanels, minimizedPanels } = usePanelContext();
  
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleRestoreAll = () => {
    restoreAllPanels();
    handleMenuClose();
  };

  const getAccentColorName = () => {
    return accentColor.charAt(0).toUpperCase() + accentColor.slice(1);
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ px: 3 }}>
          {/* Logo and title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mr: 2,
              }}
            >
              <FileText size={24} />
            </Box>
            
            <Box>
              <Typography 
                variant="h5" 
                component="h1" 
                fontWeight={600}
                sx={{ 
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                }}
              >
                Legal Document AI
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                Analyze contracts, get insights, and ask questions powered by AI
              </Typography>
            </Box>
          </motion.div>

          {/* Status indicators */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {minimizedPanels.length > 0 && (
              <Chip
                label={`${minimizedPanels.length} minimized`}
                size="small"
                onClick={handleRestoreAll}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  },
                }}
              />
            )}
            
            <Chip
              label={`${getAccentColorName()} Theme`}
              size="small"
              icon={<Palette size={12} />}
              variant="outlined"
            />
          </motion.div>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Tooltip title="Toggle theme mode">
              <IconButton
                onClick={toggleMode}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                }}
                aria-label="Toggle theme mode"
              >
                <Palette size={18} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Theme settings">
              <IconButton
                onClick={() => setShowThemeSettings(true)}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                }}
                aria-label="Open theme settings"
              >
                <Settings size={18} />
              </IconButton>
            </Tooltip>

            <Tooltip title="More options">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  },
                }}
                aria-label="More options"
                aria-controls={menuAnchor ? 'header-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuAnchor ? 'true' : undefined}
              >
                <MoreVertical size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Options Menu */}
      <Menu
        id="header-menu"
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Download size={18} />
          </ListItemIcon>
          <ListItemText>Export Document</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Share size={18} />
          </ListItemIcon>
          <ListItemText>Share Analysis</ListItemText>
        </MenuItem>
        
        {minimizedPanels.length > 0 && (
          <MenuItem onClick={handleRestoreAll}>
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            <ListItemText>Restore All Panels</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleMenuClose();
          onShowKeyboardShortcuts?.();
        }}>
          <ListItemIcon>
            <Keyboard size={18} />
          </ListItemIcon>
          <ListItemText>Keyboard Shortcuts</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          onShowHelp?.();
        }}>
          <ListItemIcon>
            <HelpCircle size={18} />
          </ListItemIcon>
          <ListItemText>Help & Support</ListItemText>
        </MenuItem>
      </Menu>

      {/* Theme Settings Modal */}
      <ThemeSettings 
        open={showThemeSettings} 
        onClose={() => setShowThemeSettings(false)} 
      />
    </>
  );
}

export default Header;