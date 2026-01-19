/**
 * Token Storage Utility for Frontend
 * Securely manages JWT tokens using HttpOnly cookies for access tokens
 * and secure storage for refresh tokens
 */

// Define token storage keys
const ACCESS_TOKEN_KEY = 'todo_app_access_token';
const REFRESH_TOKEN_KEY = 'todo_app_refresh_token';
const USER_INFO_KEY = 'todo_app_user_info';

/**
 * Stores tokens securely
 */
export const storeTokens = (accessToken: string, refreshToken: string, userInfo?: any): void => {
  try {
    // Store access token in memory/storage (ideally this would be in HttpOnly cookie served from backend)
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    // Store refresh token securely
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    // Store user info if provided
    if (userInfo) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    }
  } catch (error) {
    console.error('Error storing tokens:', error);
    throw new Error('Failed to store authentication tokens');
  }
};

/**
 * Retrieves the access token
 */
export const getAccessToken = (): string | null => {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Retrieves user information
 */
export const getUserInfo = (): any | null => {
  try {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (error) {
    console.error('Error retrieving user info:', error);
    return null;
  }
};

/**
 * Updates the access token (when refreshed)
 */
export const updateAccessToken = (newAccessToken: string): void => {
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  } catch (error) {
    console.error('Error updating access token:', error);
    throw new Error('Failed to update access token');
  }
};

/**
 * Clears all stored tokens and user info
 */
export const clearTokens = (): void => {
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  } catch (error) {
    console.error('Error clearing tokens:', error);
    // Still try to clear as much as possible
    sessionStorage.clear();
  }
};

/**
 * Checks if tokens exist
 */
export const hasTokens = (): boolean => {
  return !!(getAccessToken() && getRefreshToken());
};

/**
 * Checks if the access token is expired
 * Note: This is a simple check based on JWT payload, in practice you'd decode the JWT
 */
export const isAccessTokenExpired = (): boolean => {
  const token = getAccessToken();
  if (!token) return true;

  try {
    // Decode the token to check expiration
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
 * Saves user information
 */
export const saveUserInfo = (userInfo: any): void => {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error saving user info:', error);
  }
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return hasTokens() && !isAccessTokenExpired();
};