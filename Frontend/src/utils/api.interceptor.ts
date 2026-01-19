import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearTokens, isAccessTokenExpired, updateAccessToken } from './token-storage';
import { refreshToken } from '../services/auth.service';

/**
 * API Interceptor for Frontend
 * Automatically attaches JWT tokens to requests and handles token refresh
 */

// Create an axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 10000, // 10 seconds timeout
});

/**
 * Request interceptor to attach JWT token
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token expiration and refresh
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Check if the error is due to unauthorized access (expired/invalid token)
    if (originalRequest && error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true; // Prevent infinite retry loop

      try {
        // Try to refresh the token
        const newTokens = await refreshToken();

        if (newTokens && newTokens.access_token) {
          // Update the access token in storage
          updateAccessToken(newTokens.access_token);

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
          }
          return api(originalRequest);
        } else {
          // If refresh token also failed, redirect to login
          clearTokens();
          window.location.href = '/login'; // Redirect to login page
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If token refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    // For other errors, return the error as-is
    return Promise.reject(error);
  }
);

/**
 * Utility function to get the configured API instance
 */
export const getApiInstance = (): AxiosInstance => {
  return api;
};

/**
 * Utility function to set authentication token manually if needed
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Utility function to clear authentication token
 */
export const clearAuthToken = (): void => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;