import axios, { AxiosResponse } from 'axios';
import { getAccessToken, clearTokens } from '../utils/token-storage';
import { refreshToken } from '../services/auth.service';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to unauthorized access and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResult = await refreshToken();

        if (refreshResult && refreshResult.access_token) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${refreshResult.access_token}`;
          return api(originalRequest);
        } else {
          // If refresh failed, clear tokens and redirect to login
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If token refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Specific API functions
export const apiClient = {
  // Task-related API calls
  tasks: {
    getAll: (): Promise<AxiosResponse> => api.get('/tasks'),
    getById: (id: string): Promise<AxiosResponse> => api.get(`/tasks/${id}`),
    create: (data: any): Promise<AxiosResponse> => api.post('/tasks', data),
    update: (id: string, data: any): Promise<AxiosResponse> => api.put(`/tasks/${id}`, data),
    delete: (id: string): Promise<AxiosResponse> => api.delete(`/tasks/${id}`),
    toggleComplete: (id: string, completed: boolean): Promise<AxiosResponse> =>
      api.patch(`/tasks/${id}/complete`, { completed }),
  },

  // Auth-related API calls
  auth: {
    refresh: (refreshToken: string): Promise<AxiosResponse> =>
      api.post('/auth/refresh', { refresh_token: refreshToken }),
    logout: (): Promise<AxiosResponse> => api.post('/auth/logout'),
    getMe: (): Promise<AxiosResponse> => api.get('/auth/me'),
  }
};