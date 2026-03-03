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
      main: souqPrimary,
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
  shadows: [
    'none',
    '0 2px 8px rgba(0,0,0,0.06)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 6px 16px rgba(0,0,0,0.1)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 10px 28px rgba(0,0,0,0.12)',
    '0 12px 32px rgba(0,0,0,0.12)',
    '0 14px 36px rgba(0,0,0,0.12)',
    '0 16px 40px rgba(0,0,0,0.12)',
    '0 18px 44px rgba(0,0,0,0.12)',
    '0 20px 48px rgba(0,0,0,0.12)',
    '0 22px 52px rgba(0,0,0,0.12)',
    '0 24px 56px rgba(0,0,0,0.12)',
    '0 26px 60px rgba(0,0,0,0.12)',
    '0 28px 64px rgba(0,0,0,0.12)',
    '0 30px 68px rgba(0,0,0,0.12)',
    '0 32px 72px rgba(0,0,0,0.12)',
    '0 34px 76px rgba(0,0,0,0.12)',
    '0 36px 80px rgba(0,0,0,0.12)',
    '0 38px 84px rgba(0,0,0,0.12)',
    '0 40px 88px rgba(0,0,0,0.12)',
    '0 42px 92px rgba(0,0,0,0.12)',
    '0 44px 96px rgba(0,0,0,0.12)',
    '0 46px 100px rgba(0,0,0,0.12)',
    '0 48px 104px rgba(0,0,0,0.12)',
  ],
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

// للاستخدام في المكونات (تدرجات الهوية)
export const souqGradient = `linear-gradient(135deg, ${souqPrimary} 0%, ${souqSecondary} 100%)`;
export const souqGradientSecondary = `linear-gradient(135deg, ${souqAccent} 0%, ${souqPrimary} 100%)`;
