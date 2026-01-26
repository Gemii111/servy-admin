/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { captureException } from '../../config/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Send error to Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Paper
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'error.main',
            }}
          >
            <ErrorOutlineIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />
            <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>
              حدث خطأ غير متوقع
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              نعتذر، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو تحديث الصفحة.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  Error Details (Development Only):
                </Typography>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    display: 'block',
                    mt: 1,
                    color: 'text.secondary',
                    fontSize: 11,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={this.handleReset}>
                إعادة المحاولة
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
              >
                العودة للوحة التحكم
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

