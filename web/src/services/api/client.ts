/**
 * Axios API Client Configuration
 * 
 * This file sets up the Axios instance with:
 * - Base URL from environment variables
 * - Request/Response interceptors
 * - Error handling
 * - Authentication token injection
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { env } from '../../config/env';

/**
 * Create Axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Add authentication token to requests
 * - Add request logging in development
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const authData = localStorage.getItem('servy_admin_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.token && config.headers) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
      }
    }

    // Log request in development
    if (env.environment === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handle common error responses
 * - Handle authentication errors (401, 403)
 * - Log responses in development
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (env.environment === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (env.environment === 'development') {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - Clear auth and redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear authentication data
      localStorage.removeItem('servy_admin_auth');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // You can show a toast notification here
      console.error('Access forbidden');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error occurred');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your internet connection');
    }

    return Promise.reject(error);
  }
);

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    // Check if error response has a message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Check if error response has errors object
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstError = Object.values(errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
    
    // Check if error response has error string
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    
    // Use status text or default message
    if (axiosError.response?.statusText) {
      return axiosError.response.statusText;
    }
    
    // Network error
    if (error.message === 'Network Error') {
      return 'خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
    }
    
    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
    }
  }
  
  // Unknown error
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
};

/**
 * Export default instance
 */
export default apiClient;

