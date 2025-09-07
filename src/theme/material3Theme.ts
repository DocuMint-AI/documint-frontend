import { createTheme, Theme } from '@mui/material/styles';
import { argbFromHex, themeFromSourceColor, hexFromArgb } from '@material/material-color-utilities';

export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface Material3ThemeConfig {
  mode: ThemeMode;
  accentColor: AccentColor;
  sourceColor?: string;
}

const ACCENT_COLORS: Record<AccentColor, string> = {
  blue: '#1976d2',
  green: '#2e7d32',
  purple: '#7b1fa2',
  orange: '#f57c00',
  red: '#d32f2f',
  teal: '#00695c',
};

const PIXEL_FONTS = [
  'Google Sans',
  'Product Sans',
  'Roboto',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Helvetica Neue',
  'Arial',
  'sans-serif'
].join(', ');

export function createMaterial3Theme(config: Material3ThemeConfig): Theme {
  const { mode: themeMode, accentColor, sourceColor } = config;
  // Determine if we should use dark mode
  let isDarkMode = themeMode === 'dark';
  if (themeMode === 'auto') {
    if (typeof window !== 'undefined') {
      isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDarkMode = false; // Default to light mode on server
    }
  }
  
  // Get source color for Material You theming
  const materialSourceColor = sourceColor || ACCENT_COLORS[accentColor];
  const sourceArgb = argbFromHex(materialSourceColor);
  const materialTheme = themeFromSourceColor(sourceArgb);
  
  // Extract Material 3 color tokens
  const scheme = isDarkMode ? materialTheme.schemes.dark : materialTheme.schemes.light;
  
  // Create derived surface colors for containers (Material 3 design)
  const surfaceBase = hexFromArgb(scheme.surface);
  const primaryContainer = hexFromArgb(scheme.primaryContainer);
  
  // Convert Material 3 tokens to hex
  const tokens = {
    primary: hexFromArgb(scheme.primary),
    onPrimary: hexFromArgb(scheme.onPrimary),
    primaryContainer: primaryContainer,
    onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
    secondary: hexFromArgb(scheme.secondary),
    onSecondary: hexFromArgb(scheme.onSecondary),
    secondaryContainer: hexFromArgb(scheme.secondaryContainer),
    onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
    tertiary: hexFromArgb(scheme.tertiary),
    onTertiary: hexFromArgb(scheme.onTertiary),
    tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
    onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
    error: hexFromArgb(scheme.error),
    onError: hexFromArgb(scheme.onError),
    errorContainer: hexFromArgb(scheme.errorContainer),
    onErrorContainer: hexFromArgb(scheme.onErrorContainer),
    surface: surfaceBase,
    onSurface: hexFromArgb(scheme.onSurface),
    surfaceVariant: hexFromArgb(scheme.surfaceVariant),
    onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
    // Create surface container variants manually for Material 3 design
    surfaceContainer: primaryContainer,
    surfaceContainerHigh: isDarkMode ? '#2d3135' : '#f0f4f9',
    surfaceContainerHighest: isDarkMode ? '#383a3e' : '#e1e7ed',
    surfaceContainerLow: isDarkMode ? '#1d1f23' : '#f5f9fe',
    surfaceContainerLowest: isDarkMode ? '#0f1114' : '#ffffff',
    inverseSurface: hexFromArgb(scheme.inverseSurface),
    inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
    inversePrimary: hexFromArgb(scheme.inversePrimary),
    outline: hexFromArgb(scheme.outline),
    outlineVariant: hexFromArgb(scheme.outlineVariant),
    background: hexFromArgb(scheme.background),
    onBackground: hexFromArgb(scheme.onBackground),
  };

  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: tokens.primary,
        contrastText: tokens.onPrimary,
        light: tokens.primaryContainer,
        dark: tokens.onPrimaryContainer,
      },
      secondary: {
        main: tokens.secondary,
        contrastText: tokens.onSecondary,
        light: tokens.secondaryContainer,
        dark: tokens.onSecondaryContainer,
      },
      tertiary: {
        main: tokens.tertiary,
        contrastText: tokens.onTertiary,
        light: tokens.tertiaryContainer,
        dark: tokens.onTertiaryContainer,
      } as any,
      error: {
        main: tokens.error,
        contrastText: tokens.onError,
        light: tokens.errorContainer,
        dark: tokens.onErrorContainer,
      },
      background: {
        default: tokens.background,
        paper: tokens.surface,
      },
      surface: {
        main: tokens.surface,
        variant: tokens.surfaceVariant,
        container: tokens.surfaceContainer,
        containerHigh: tokens.surfaceContainerHigh,
        containerHighest: tokens.surfaceContainerHighest,
        containerLow: tokens.surfaceContainerLow,
        containerLowest: tokens.surfaceContainerLowest,
      } as any,
      text: {
        primary: tokens.onSurface,
        secondary: tokens.onSurfaceVariant,
      },
      divider: tokens.outlineVariant,
      outline: tokens.outline,
    },
    typography: {
      fontFamily: PIXEL_FONTS,
      // Material 3 Typography Scale
      h1: {
        fontSize: '3.5rem',
        fontWeight: 400,
        lineHeight: 1.14,
        letterSpacing: '-0.025em',
      },
      h2: {
        fontSize: '2.8125rem',
        fontWeight: 400,
        lineHeight: 1.16,
        letterSpacing: '-0.025em',
      },
      h3: {
        fontSize: '2.25rem',
        fontWeight: 400,
        lineHeight: 1.22,
        letterSpacing: 0,
      },
      h4: {
        fontSize: '1.75rem',
        fontWeight: 400,
        lineHeight: 1.29,
        letterSpacing: '0.007em',
      },
      h5: {
        fontSize: '1.375rem',
        fontWeight: 400,
        lineHeight: 1.36,
        letterSpacing: 0,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.44,
        letterSpacing: '0.007em',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: '0.009em',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.57,
        letterSpacing: '0.007em',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: '0.009em',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: 1.43,
        letterSpacing: '0.011em',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.43,
        letterSpacing: '0.046em',
        textTransform: 'none',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.33,
        letterSpacing: '0.033em',
      },
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 500,
        lineHeight: 1.45,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 12, // Pixel OS rounded corners
    },
    spacing: 8,
    shadows: [
      'none',
      '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
      '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
      '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
      '0px 2px 3px rgba(0, 0, 0, 0.3), 0px 6px 10px 4px rgba(0, 0, 0, 0.15)',
      '0px 4px 4px rgba(0, 0, 0, 0.3), 0px 8px 12px 6px rgba(0, 0, 0, 0.15)',
      '0px 6px 6px rgba(0, 0, 0, 0.3), 0px 10px 14px 8px rgba(0, 0, 0, 0.15)',
      '0px 8px 8px rgba(0, 0, 0, 0.3), 0px 12px 16px 10px rgba(0, 0, 0, 0.15)',
      '0px 10px 10px rgba(0, 0, 0, 0.3), 0px 14px 18px 12px rgba(0, 0, 0, 0.15)',
      '0px 12px 12px rgba(0, 0, 0, 0.3), 0px 16px 20px 14px rgba(0, 0, 0, 0.15)',
      '0px 14px 14px rgba(0, 0, 0, 0.3), 0px 18px 22px 16px rgba(0, 0, 0, 0.15)',
      '0px 16px 16px rgba(0, 0, 0, 0.3), 0px 20px 24px 18px rgba(0, 0, 0, 0.15)',
      '0px 18px 18px rgba(0, 0, 0, 0.3), 0px 22px 26px 20px rgba(0, 0, 0, 0.15)',
      '0px 20px 20px rgba(0, 0, 0, 0.3), 0px 24px 28px 22px rgba(0, 0, 0, 0.15)',
      '0px 22px 22px rgba(0, 0, 0, 0.3), 0px 26px 30px 24px rgba(0, 0, 0, 0.15)',
      '0px 24px 24px rgba(0, 0, 0, 0.3), 0px 28px 32px 26px rgba(0, 0, 0, 0.15)',
      '0px 26px 26px rgba(0, 0, 0, 0.3), 0px 30px 34px 28px rgba(0, 0, 0, 0.15)',
      '0px 28px 28px rgba(0, 0, 0, 0.3), 0px 32px 36px 30px rgba(0, 0, 0, 0.15)',
      '0px 30px 30px rgba(0, 0, 0, 0.3), 0px 34px 38px 32px rgba(0, 0, 0, 0.15)',
      '0px 32px 32px rgba(0, 0, 0, 0.3), 0px 36px 40px 34px rgba(0, 0, 0, 0.15)',
      '0px 34px 34px rgba(0, 0, 0, 0.3), 0px 38px 42px 36px rgba(0, 0, 0, 0.15)',
      '0px 36px 36px rgba(0, 0, 0, 0.3), 0px 40px 44px 38px rgba(0, 0, 0, 0.15)',
      '0px 38px 38px rgba(0, 0, 0, 0.3), 0px 42px 46px 40px rgba(0, 0, 0, 0.15)',
      '0px 40px 40px rgba(0, 0, 0, 0.3), 0px 44px 48px 42px rgba(0, 0, 0, 0.15)',
      '0px 42px 42px rgba(0, 0, 0, 0.3), 0px 46px 50px 44px rgba(0, 0, 0, 0.15)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: PIXEL_FONTS,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            backgroundColor: tokens.primary,
            color: tokens.onPrimary,
            '&:hover': {
              backgroundColor: tokens.primaryContainer,
              color: tokens.onPrimaryContainer,
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            },
          },
          outlined: {
            borderColor: tokens.outline,
            color: tokens.primary,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: tokens.surfaceContainerHighest,
              borderColor: tokens.outline,
            },
          },
          text: {
            color: tokens.primary,
            '&:hover': {
              backgroundColor: tokens.surfaceContainerHighest,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            padding: 12,
            '&:hover': {
              backgroundColor: tokens.surfaceContainerHighest,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: tokens.surfaceContainer,
            border: `1px solid ${tokens.outlineVariant}`,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: tokens.surface,
          },
          elevation1: {
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${tokens.outlineVariant}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: tokens.surfaceContainerHighest,
              '& fieldset': {
                borderColor: tokens.outline,
              },
              '&:hover fieldset': {
                borderColor: tokens.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: tokens.primary,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: tokens.secondaryContainer,
            color: tokens.onSecondaryContainer,
            fontSize: '0.8125rem',
            height: 32,
            '&:hover': {
              backgroundColor: tokens.surfaceContainerHigh,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.surface,
            color: tokens.onSurface,
            boxShadow: 'none',
            borderBottom: `1px solid ${tokens.outlineVariant}`,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: tokens.outlineVariant,
          },
        },
      },
    },
  });
}

// Extend MUI theme interface for custom tokens
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    surface: {
      main: string;
      variant: string;
      container: string;
      containerHigh: string;
      containerHighest: string;
      containerLow: string;
      containerLowest: string;
    };
    outline: string;
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    surface?: {
      main?: string;
      variant?: string;
      container?: string;
      containerHigh?: string;
      containerHighest?: string;
      containerLow?: string;
      containerLowest?: string;
    };
    outline?: string;
  }
}