import { getRefreshToken, storeTokens, clearTokens } from '../utils/token-storage';

/**
 * Authentication Service for Frontend
 * Handles authentication operations including token refresh and logout
 */

/**
 * Refreshes the access token using the refresh token
 */
export const refreshToken = async (): Promise<{ access_token: string; token_type: string; expires_in: number } | null> => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    // Make request to backend refresh endpoint
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken
      })
    });

    if (response.ok) {
      const data = await response.json();

      // Store the new tokens
      if (data.access_token && data.refresh_token) {
        // In a real implementation, we'd also update the refresh token if rotated
        storeTokens(data.access_token, data.refresh_token || refreshToken);
      } else if (data.access_token) {
        // If only access token is returned, keep the same refresh token
        const currentRefreshToken = getRefreshToken();
        if (currentRefreshToken) {
          storeTokens(data.access_token, currentRefreshToken);
        }
      }

      return {
        access_token: data.access_token,
        token_type: data.token_type || 'bearer',
        expires_in: data.expires_in || 900 // 15 minutes default
      };
    } else {
      // If refresh token request fails, clear all tokens
      clearTokens();
      throw new Error(`Token refresh failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    clearTokens(); // Clear tokens if refresh fails
    return null;
  }
};

/**
 * Checks if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  // We can check if tokens exist and are not expired
  const accessToken = getAccessToken();
  return !!accessToken && !isTokenExpired(accessToken);
};

/**
 * Gets the current access token
 */
export const getAccessToken = (): string | null => {
  // In a real implementation, this would get the token from HttpOnly cookie via an API call
  // For now, we'll simulate by checking if we have a token in storage
  if (typeof window !== 'undefined') {
    // This is a simplified version - in reality, the access token would be in an HttpOnly cookie
    // and we'd have a secure endpoint to check if the user is still authenticated
    return localStorage.getItem('todo_app_access_token') || sessionStorage.getItem('todo_app_access_token');
  }
  return null;
};

/**
 * Checks if a token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return true; // Invalid token format
    }

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't decode
  }
};

/**
 * Performs logout by clearing all tokens
 */
export const logout = async (): Promise<void> => {
  try {
    // Call the backend logout endpoint to perform any server-side cleanup
    // Even though we have a stateless system, this provides a way to handle logout centrally
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      }
    }).catch(() => {
      // Ignore errors during logout - we'll clear tokens anyway
    });

    // Clear all tokens from storage
    clearTokens();

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Still clear tokens even if the API call fails
    clearTokens();

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

/**
 * Gets the current user information
 */
export const getCurrentUser = async (): Promise<any | null> => {
  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Failed to get user info: ${response.status}`);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Initializes authentication state on app startup
 */
export const initializeAuth = async (): Promise<boolean> => {
  try {
    // Check if we have tokens and they're still valid
    const token = getAccessToken();

    if (!token) {
      return false;
    }

    if (isTokenExpired(token)) {
      // Try to refresh the token
      const refreshResult = await refreshToken();
      return !!refreshResult;
    }

    return true;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return false;
  }
};

/**
 * Sets up authentication listeners for tab/window events
 */
export const setupAuthListeners = (): void => {
  // Listen for storage events to synchronize auth state across tabs
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'todo_app_access_token' || e.key === 'todo_app_refresh_token') {
        // Auth state changed in another tab, handle accordingly
        // For example, redirect to login if tokens were cleared
        if (!getAccessToken()) {
          window.location.href = '/login';
        }
      }
    });
  }
};