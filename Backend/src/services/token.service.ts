import {
  createAccessToken as createBackendAccessToken,
  createRefreshToken as createBackendRefreshToken,
  verifyAccessToken as verifyBackendAccessToken,
  verifyRefreshToken as verifyBackendRefreshToken,
  extractUserIdFromTokenPayload
} from '../../../Authentication/tokens/jwt-utils';
import { TOKEN_CONSTANTS } from '../../../Authentication/tokens/token.constants';

/**
 * Token Service for Backend
 * Manages the creation, validation, and handling of JWT tokens
 */

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  [key: string]: any;
}

export class TokenService {
  /**
   * Creates a new token pair (access + refresh tokens)
   */
  static async createTokenPair(userId: string, email: string): Promise<TokenPair> {
    try {
      // Create access token (15 minutes)
      const accessToken = await createBackendAccessToken(userId, email);

      // Create refresh token (7 days)
      const refreshToken = await createBackendRefreshToken(userId);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'bearer',
        expires_in: TOKEN_CONSTANTS.ACCESS_TOKEN_EXPIRY_SECONDS,
        expires_at: Math.floor(Date.now() / 1000) + TOKEN_CONSTANTS.ACCESS_TOKEN_EXPIRY_SECONDS
      };
    } catch (error) {
      throw new Error(`Failed to create token pair: ${(error as Error).message}`);
    }
  }

  /**
   * Verifies an access token and returns its payload
   */
  static async verifyAccessToken(token: string): Promise<any> {
    try {
      return await verifyBackendAccessToken(token);
    } catch (error) {
      throw new Error(`Access token verification failed: ${(error as Error).message}`);
    }
  }

  /**
   * Verifies a refresh token and returns its payload
   */
  static async verifyRefreshToken(token: string): Promise<any> {
    try {
      return await verifyBackendRefreshToken(token);
    } catch (error) {
      throw new Error(`Refresh token verification failed: ${(error as Error).message}`);
    }
  }

  /**
   * Extracts user ID from a token payload
   */
  static extractUserId(payload: any): string {
    return extractUserIdFromTokenPayload(payload);
  }

  /**
   * Checks if a token is expired
   */
  static isTokenExpired(payload: any): boolean {
    if (!payload.exp) {
      return true; // If no expiration, consider it expired
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Creates an access token only
   */
  static async createAccessToken(userId: string, email: string): Promise<string> {
    try {
      return await createBackendAccessToken(userId, email);
    } catch (error) {
      throw new Error(`Failed to create access token: ${(error as Error).message}`);
    }
  }

  /**
   * Creates a refresh token only
   */
  static async createRefreshToken(userId: string): Promise<string> {
    try {
      return await createBackendRefreshToken(userId);
    } catch (error) {
      throw new Error(`Failed to create refresh token: ${(error as Error).message}`);
    }
  }

  /**
   * Validates a token pair (checks if access token is still valid)
   */
  static async validateTokenPair(accessToken: string): Promise<boolean> {
    try {
      const payload = await this.verifyAccessToken(accessToken);
      return !this.isTokenExpired(payload);
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets token expiration information
   */
  static getTokenExpirationInfo(token: string, type: 'access' | 'refresh'): { expiresAt: number; expiresIn: number } {
    // This would require decoding the token to get the exp claim
    // For now, we return the standard expiration times
    if (type === 'access') {
      return {
        expiresAt: Math.floor(Date.now() / 1000) + TOKEN_CONSTANTS.ACCESS_TOKEN_EXPIRY_SECONDS,
        expiresIn: TOKEN_CONSTANTS.ACCESS_TOKEN_EXPIRY_SECONDS
      };
    } else {
      return {
        expiresAt: Math.floor(Date.now() / 1000) + TOKEN_CONSTANTS.REFRESH_TOKEN_EXPIRY_SECONDS,
        expiresIn: TOKEN_CONSTANTS.REFRESH_TOKEN_EXPIRY_SECONDS
      };
    }
  }
}