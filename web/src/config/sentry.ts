/**
 * Sentry Error Tracking Configuration
 * 
 * This file initializes Sentry for error tracking in production.
 * Set REACT_APP_SENTRY_DSN in your .env file to enable Sentry.
 */

import * as Sentry from '@sentry/react';
import { env } from './env';

/**
 * Initialize Sentry if enabled and DSN is provided
 */
export const initSentry = (): void => {
  // Only initialize if explicitly enabled and DSN is provided
  if (!env.enableSentry || !env.sentryDsn) {
    // Silently skip initialization if not configured
    return;
  }

  try {
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.sentryEnvironment,
      // Performance Monitoring
      tracesSampleRate: env.environment === 'production' ? 0.1 : 1.0,
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Don't send events in development
        if (env.environment === 'development') {
          return null;
        }

        // Filter out sensitive information
        if (event.request) {
          // Remove sensitive headers
          if (event.request.headers) {
            delete event.request.headers.Authorization;
            delete event.request.headers['X-API-Key'];
          }
        }

        return event;
      },
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        'fb_xd_fragment',
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        'conduitPage',
        // Network errors
        'NetworkError',
        'Network request failed',
        // Chrome extensions
        'chrome-extension://',
        // Other
        'ResizeObserver loop limit exceeded',
      ],
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry initialized successfully');
    }
  } catch (error) {
    // Don't throw error - just log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to initialize Sentry:', error);
    }
  }
};

/**
 * Capture exception manually
 */
export const captureException = (error: Error, context?: Record<string, any>): void => {
  if (env.enableSentry && env.sentryDsn) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

/**
 * Capture message manually
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info'): void => {
  if (env.enableSentry && env.sentryDsn) {
    Sentry.captureMessage(message, level);
  }
};

/**
 * Set user context for Sentry
 */
export const setUserContext = (user: { id: string; email?: string; name?: string }): void => {
  if (env.enableSentry && env.sentryDsn) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
};

/**
 * Clear user context
 */
export const clearUserContext = (): void => {
  if (env.enableSentry && env.sentryDsn) {
    Sentry.setUser(null);
  }
};

