/**
 * Token Constants for Authentication Component
 * Defines token expiration times as per requirements:
 * - Access tokens: 15 minutes
 * - Refresh tokens: 7 days
 */

export const TOKEN_CONSTANTS = {
  ACCESS_TOKEN_EXPIRY_SECONDS: 15 * 60, // 15 minutes
  REFRESH_TOKEN_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 days
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  JWT_ALGORITHM: 'RS256', // Recommended algorithm for security
  TOKEN_TYPE_ACCESS: 'access',
  TOKEN_TYPE_REFRESH: 'refresh',
  TOKEN_HEADER_PREFIX: 'Bearer ',
} as const;

export type TokenType = typeof TOKEN_CONSTANTS.TOKEN_TYPE_ACCESS | typeof TOKEN_CONSTANTS.TOKEN_TYPE_REFRESH;