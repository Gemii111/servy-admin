import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import './index.css';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { SnackbarProvider } from './hooks/useSnackbar';
import ErrorBoundary from './components/common/ErrorBoundary';
import { initSentry } from './config/sentry';

// Initialize Sentry before anything else
// Wrap in try-catch to prevent blocking app if Sentry fails
try {
  initSentry();
} catch (error) {
  // Don't block app initialization if Sentry fails
  if (process.env.NODE_ENV === 'development') {
    console.error('Failed to initialize Sentry:', error);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // تقليل إعادة المحاولات لتجنب 429 والطلبات المتكررة عند أخطاء السيرفر
      retry: (failureCount, error: unknown) => {
        if (failureCount >= 1) return false;
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 429 || (status && status >= 500)) return false;
        if (status && status >= 400) return false;
        return true;
      },
    },
  },
});

// إعداد cache خاص بالـ RTL لـ MUI
const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <CacheProvider value={rtlCache}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SnackbarProvider>
              <BrowserRouter>
                <CssBaseline />
                <App />
              </BrowserRouter>
            </SnackbarProvider>
          </AuthProvider>
        </QueryClientProvider>
      </CacheProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
