import { verifyRefreshToken, createAccessToken } from './jwt-utils';
import { TOKEN_CONSTANTS } from './token.constants';

/**
 * Token Refresh Service
 * Handles refreshing access tokens using valid refresh tokens
 */
export class TokenRefreshService {
  /**
   * Refreshes an access token using a valid refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    try {
      // Verify the refresh token
      const payload = await verifyRefreshToken(refreshToken);

      // Check if refresh token is expired
      if ('exp' in payload) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          throw new Error('Refresh token has expired');
        }
      }

      // Extract user information from the refresh token
      const userId = payload.sub as string;
      const userEmail = payload.email as string || '';

      // Create a new access token
      const newAccessToken = await createAccessToken(userId, userEmail);

      // For security reasons, we could also issue a new refresh token
      // (rotating refresh tokens), but for simplicity we'll just return the new access token
      return {
        accessToken: newAccessToken,
        // Optionally return a new refresh token if rotation is implemented
        // refreshToken: await createRefreshToken(userId)
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validates if a refresh token is still valid
   */
  static async isValidRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      await verifyRefreshToken(refreshToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the user ID from a refresh token
   */
  static async getUserIdFromRefreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = await verifyRefreshToken(refreshToken);
      return payload.sub as string;
    } catch (error) {
      throw new Error(`Could not extract user ID from refresh token: ${(error as Error).message}`);
    }
  }
}