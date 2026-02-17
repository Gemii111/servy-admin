import { createTheme } from '@mui/material/styles';

// Souq brand — Light theme (التسويق والموقع)
const souqPrimary = '#86B573';
const souqSecondary = '#6A9A5A';
const souqAccent = '#9BCB88';
const souqDark = '#5A8A4A';
const pageBg = '#F5F9F3';
const surfaceBg = '#FFFFFF';
const textPrimary = '#1A2E1A';
const textSecondary = '#3A4A3A';
const textTertiary = '#5A6A5A';
const borderLight = '#B1C0B1';

export const appTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: souqPrimary,
      light: souqAccent,
      dark: souqSecondary,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: souqSecondary,
      light: souqAccent,
      dark: souqDark,
      contrastText: '#FFFFFF',
    },
    background: {
      default: pageBg,
      paper: surfaceBg,
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: textTertiary,
    },
    success: {
      main: '#5A8A4A',
    },
    warning: {
      main: '#D97706',
    },
    error: {
      main: '#DC2626',
    },
    info: {
      main: '#86B573',
    },
    divider: borderLight,
  },
  typography: {
    fontFamily: '"Cairo", "Segoe UI", system-ui, -apple-system, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: 44,
          borderRadius: 24,
          fontWeight: 700,
        },
        contained: {
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: souqSecondary,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'medium',
      },
    },
  },
});

export const souqGradient = `linear-gradient(135deg, ${souqPrimary} 0%, ${souqSecondary} 100%)`;
export const souqGradientSecondary = `linear-gradient(135deg, ${souqAccent} 0%, ${souqPrimary} 100%)`;
