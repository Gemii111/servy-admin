/**
 * Error Handler Utility
 * 
 * Centralized error handling for the application
 */

import { captureException, captureMessage } from '../config/sentry';
import { useSnackbar } from '../hooks/useSnackbar';

/**
 * Error types
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error handler class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = ErrorType.UNKNOWN,
    public code?: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle error and show user-friendly message
 */
export const handleError = (
  error: unknown,
  showNotification: boolean = true
): AppError => {
  let appError: AppError;

  // Handle AppError
  if (error instanceof AppError) {
    appError = error;
  }
  // Handle Axios errors
  else if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any;
    const statusCode = axiosError.response?.status;
    const message = axiosError.response?.data?.message || axiosError.message;

    appError = new AppError(
      message || 'حدث خطأ في الاتصال بالخادم',
      statusCode === 401 || statusCode === 403 ? ErrorType.AUTH : ErrorType.API,
      axiosError.code,
      statusCode,
      axiosError
    );
  }
  // Handle network errors
  else if (error instanceof Error) {
    if (error.message.includes('Network') || error.message.includes('network')) {
      appError = new AppError(
        'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك.',
        ErrorType.NETWORK,
        'NETWORK_ERROR',
        undefined,
        error
      );
    } else {
      appError = new AppError(
        error.message || 'حدث خطأ غير متوقع',
        ErrorType.UNKNOWN,
        undefined,
        undefined,
        error
      );
    }
  }
  // Handle unknown errors
  else {
    appError = new AppError(
      'حدث خطأ غير متوقع',
      ErrorType.UNKNOWN
    );
  }

  // Log to Sentry
  captureException(appError.originalError || appError, {
    type: appError.type,
    code: appError.code,
    statusCode: appError.statusCode,
  });

  // Show notification if enabled
  if (showNotification) {
    // This will be handled by the component using useSnackbar
    // We can't use hooks here, so we'll return the error message
  }

  return appError;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  const appError = handleError(error, false);

  switch (appError.type) {
    case ErrorType.NETWORK:
      return 'خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك.';
    case ErrorType.AUTH:
      return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
    case ErrorType.VALIDATION:
      return appError.message || 'البيانات المدخلة غير صحيحة.';
    case ErrorType.API:
      return appError.message || 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.';
    default:
      return appError.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
};

/**
 * Handle API error with snackbar
 */
export const handleApiErrorWithSnackbar = (
  error: unknown,
  showSnackbar: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => void
): void => {
  const message = getErrorMessage(error);
  showSnackbar(message, 'error');
};

