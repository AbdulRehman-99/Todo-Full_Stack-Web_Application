import axios, { AxiosResponse } from 'axios';
import { getAccessToken, clearTokens } from '../utils/token-storage';
import { refreshToken } from '../services/auth.service';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000',
  timeout: 30000,
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

// Helper function to get user_id from token
const getUserIdFromToken = (): string => {
  const token = getAccessToken();
  if (!token) {
    return "unknown";
  }

  try {
    // Decode the JWT token to get the user_id
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      let payload = tokenParts[1];
      // Add padding if needed (base64url to base64 standard conversion)
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) {
        payload += '=';
      }

      const payloadDecoded = atob(payload);
      const payloadObj = JSON.parse(payloadDecoded);
      return payloadObj.sub || payloadObj.user_id || payloadObj.id || "unknown";
    }
  } catch (e) {
    console.warn("Could not decode token to get user_id:", e);
  }

  return "unknown";
};

// Helper function to convert date strings in task objects to Date objects
const convertTaskDates = (task: any): any => {
  return {
    ...task,
    createdAt: task.created_at ? new Date(task.created_at) : new Date(),
    updatedAt: task.updated_at ? new Date(task.updated_at) : undefined
  };
};

// Helper function to convert date strings in task lists to Date objects
const convertTaskListDates = (tasks: any[]): any[] => {
  return tasks.map(task => convertTaskDates(task));
};

// Specific API functions
export const apiClient = {
  // Task-related API calls
  tasks: {
    getAll: async (): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      const response = await api.get(`/api/${userId}/tasks/`);
      if (response.data && Array.isArray(response.data)) {
        response.data = convertTaskListDates(response.data);
      }
      return response;
    },
    getById: async (id: string): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      const response = await api.get(`/api/${userId}/tasks/${id}`);
      if (response.data) {
        response.data = convertTaskDates(response.data);
      }
      return response;
    },
    create: async (data: any): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      const response = await api.post(`/api/${userId}/tasks/`, data);
      if (response.data) {
        response.data = convertTaskDates(response.data);
      }
      return response;
    },
    update: async (id: string, data: any): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      const response = await api.put(`/api/${userId}/tasks/${id}`, data);
      if (response.data) {
        response.data = convertTaskDates(response.data);
      }
      return response;
    },
    delete: (id: string): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      return api.delete(`/api/${userId}/tasks/${id}`);
    },
    toggleComplete: async (id: string, completed: boolean): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      const response = await api.put(`/api/${userId}/tasks/${id}`, { completed });
      if (response.data) {
        response.data = convertTaskDates(response.data);
      }
      return response;
    },
  },

  // Auth-related API calls
  auth: {
    refresh: (refreshToken: string): Promise<AxiosResponse> =>
      api.post('/api/v1/refresh', { refresh_token: refreshToken }),
    logout: (): Promise<AxiosResponse> => api.post('/api/v1/logout'),
    getMe: (): Promise<AxiosResponse> => api.get('/api/v1/me'),
  },

  // Chat-related API calls
  chat: {
    sendChatMessage: async (message: string, conversationId?: number): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      // Route is POST /api/{user_id}
      return api.post(`/api/${userId}`, { 
        message, 
        conversation_id: conversationId 
      });
    },
    getConversations: async (): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      // Route is GET /api/{user_id}/conversations
      return api.get(`/api/${userId}/conversations`);
    },
    getConversationHistory: async (conversationId: number): Promise<AxiosResponse> => {
      const userId = getUserIdFromToken();
      // Route is GET /api/{user_id}/conversation/{conversation_id}
      return api.get(`/api/${userId}/conversation/${conversationId}`);
    }
  }
};