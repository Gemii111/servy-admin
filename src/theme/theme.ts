import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563EB', // Primary
    },
    background: {
      default: '#0F172A', // AppBackground
      paper: '#111827', // CardBackground / TopBar / Sidebar base
    },
    text: {
      primary: '#E5E7EB',
      secondary: '#9CA3AF',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#38BDF8',
    },
  },
  typography: {
    fontFamily:
      '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Roboto", "Noto Sans Arabic", "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          height: 44,
          borderRadius: 12,
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


