/**
 * Base API Service
 * 
 * This file provides a base class for API services that can work with both
 * mock data (for development) and real API calls (for production).
 */

import { apiClient, ApiResponse, PaginatedResponse, handleApiError } from './client';
import { env } from '../../config/env';

/**
 * Base API Service Class
 * Provides common methods for API services
 */
export class BaseApiService {
  protected baseUrl: string;
  protected useMock: boolean;

  constructor(endpoint: string, useMock: boolean = false) {
    this.baseUrl = `/api/${endpoint}`;
    this.useMock = useMock || env.environment === 'development';
  }

  /**
   * Make GET request
   */
  protected async get<T>(url: string, config?: any): Promise<T> {
    if (this.useMock) {
      // In development, return mock data
      // This will be handled by individual service files
      throw new Error('Mock data should be handled by individual service files');
    }

    try {
      const response = await apiClient.get<ApiResponse<T>>(`${this.baseUrl}${url}`, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch data');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Make POST request
   */
  protected async post<T>(url: string, data?: any, config?: any): Promise<T> {
    if (this.useMock) {
      throw new Error('Mock data should be handled by individual service files');
    }

    try {
      const response = await apiClient.post<ApiResponse<T>>(`${this.baseUrl}${url}`, data, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to create resource');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Make PUT request
   */
  protected async put<T>(url: string, data?: any, config?: any): Promise<T> {
    if (this.useMock) {
      throw new Error('Mock data should be handled by individual service files');
    }

    try {
      const response = await apiClient.put<ApiResponse<T>>(`${this.baseUrl}${url}`, data, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update resource');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Make PATCH request
   */
  protected async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    if (this.useMock) {
      throw new Error('Mock data should be handled by individual service files');
    }

    try {
      const response = await apiClient.patch<ApiResponse<T>>(`${this.baseUrl}${url}`, data, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to update resource');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Make DELETE request
   */
  protected async delete<T>(url: string, config?: any): Promise<T> {
    if (this.useMock) {
      throw new Error('Mock data should be handled by individual service files');
    }

    try {
      const response = await apiClient.delete<ApiResponse<T>>(`${this.baseUrl}${url}`, config);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to delete resource');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

/**
 * Helper function to switch between mock and real API
 * Set REACT_APP_USE_MOCK_API=true in .env to use mock data
 */
export const shouldUseMock = (): boolean => {
  const useMock = process.env.REACT_APP_USE_MOCK_API === 'true';
  return useMock || env.environment === 'development';
};

