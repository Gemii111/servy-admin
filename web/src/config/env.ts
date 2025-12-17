/**
 * Environment Variables Configuration
 * 
 * This file provides type-safe access to environment variables.
 * All environment variables must be prefixed with REACT_APP_ to be accessible in the browser.
 */

interface EnvConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  environment: 'development' | 'production' | 'test';
  sentryDsn: string | undefined;
  sentryEnvironment: string;
  enableAnalytics: boolean;
  enableSentry: boolean;
}

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    if (process.env.NODE_ENV === 'production') {
      console.warn(`Environment variable ${key} is not set`);
    }
    return '';
  }
  return value;
};

/**
 * Get boolean environment variable
 */
const getBooleanEnvVar = (key: string, defaultValue: boolean = false): boolean => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Get number environment variable
 */
const getNumberEnvVar = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.warn(`Invalid number for ${key}, using default: ${defaultValue}`);
    return defaultValue;
  }
  return parsed;
};

/**
 * Environment configuration
 */
export const env: EnvConfig = {
  apiBaseUrl: getEnvVar('REACT_APP_API_BASE_URL', 'http://localhost:3000/api'),
  apiTimeout: getNumberEnvVar('REACT_APP_API_TIMEOUT', 30000),
  environment: (getEnvVar('REACT_APP_ENV', process.env.NODE_ENV || 'development') as EnvConfig['environment']) || 'development',
  sentryDsn: getEnvVar('REACT_APP_SENTRY_DSN') || undefined,
  sentryEnvironment: getEnvVar('REACT_APP_SENTRY_ENVIRONMENT', process.env.NODE_ENV || 'development'),
  enableAnalytics: getBooleanEnvVar('REACT_APP_ENABLE_ANALYTICS', false),
  enableSentry: getBooleanEnvVar('REACT_APP_ENABLE_SENTRY', false),
};

/**
 * Check if running in development mode
 */
export const isDevelopment = env.environment === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = env.environment === 'production';

/**
 * Validate required environment variables
 */
export const validateEnv = (): void => {
  // Don't validate in production build - let it fail gracefully
  // Environment variables should be set in Vercel, but we don't want to break the build
  if (process.env.NODE_ENV === 'development') {
    const required = ['REACT_APP_API_BASE_URL'];
    const missing: string[] = [];

    required.forEach((key) => {
      if (!process.env[key]) {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }
  }
};

// Validate on module load (only in development)
validateEnv();

