import { useState, useEffect, useCallback } from 'react';
import { refreshToken, isAuthenticated } from '../services/auth.service';
import { getAccessToken, isAccessTokenExpired } from '../utils/token-storage';

/**
 * Custom Hook for Token Refresh Management
 * Handles automatic token refresh and authentication state
 */

interface TokenRefreshHook {
  isRefreshing: boolean;
  isAuthenticated: boolean;
  lastChecked: Date | null;
  refreshTokens: () => Promise<boolean>;
  checkAuthStatus: () => boolean;
}

export const useTokenRefresh = (): TokenRefreshHook => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback((): boolean => {
    const authenticated = isAuthenticated();
    setAuthStatus(authenticated);
    setLastChecked(new Date());
    return authenticated;
  }, []);

  /**
   * Refresh tokens
   */
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) {
      return false; // Prevent multiple simultaneous refresh attempts
    }

    setIsRefreshing(true);

    try {
      const result = await refreshToken();
      if (result && result.access_token) {
        setAuthStatus(true);
        setLastChecked(new Date());
        return true;
      } else {
        setAuthStatus(false);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setAuthStatus(false);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  /**
   * Check if token needs refresh
   */
  const checkAndRefreshIfNeeded = useCallback(async () => {
    const tokenExists = getAccessToken() !== null;

    if (!tokenExists) {
      setAuthStatus(false);
      return;
    }

    const tokenExpired = isAccessTokenExpired();

    if (tokenExpired) {
      await refreshTokens();
    } else {
      checkAuthStatus();
    }
  }, [checkAuthStatus, refreshTokens]);

  // Check authentication status on mount and periodically
  useEffect(() => {
    checkAndRefreshIfNeeded();

    // Set up periodic checks (every 5 minutes)
    const intervalId = setInterval(() => {
      checkAndRefreshIfNeeded();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [checkAndRefreshIfNeeded]);

  return {
    isRefreshing,
    isAuthenticated: authStatus,
    lastChecked,
    refreshTokens,
    checkAuthStatus
  };
};

/**
 * Hook to check authentication status without refresh capability
 */
export const useAuthStatus = (): boolean => {
  const [authStatus, setAuthStatus] = useState<boolean>(false);

  useEffect(() => {
    const checkStatus = () => {
      const authenticated = isAuthenticated();
      setAuthStatus(authenticated);
    };

    checkStatus();

    // Listen for storage events to update auth status across tabs
    const handleStorageChange = () => {
      checkStatus();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return authStatus;
};

/**
 * Hook to get the current user ID from token
 */
export const useCurrentUser = (): string | null => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // This would require decoding the JWT to extract the user ID
    // For now, we'll return null - in a real implementation you'd decode the token
    const token = getAccessToken();
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setUserId(payload.sub || payload.userId || null);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  }, []);

  return userId;
};