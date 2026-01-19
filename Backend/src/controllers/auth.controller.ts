import { Request, Response } from 'express';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../../Authentication/tokens/jwt-utils';
import { TokenRefreshService } from '../../../Authentication/tokens/refresh.service';

/**
 * Authentication Controller for Backend
 * Handles authentication-related API requests
 */

export class AuthController {
  /**
   * Refreshes an access token using a valid refresh token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Expecting refresh token in request body
      const { refresh_token } = req.body;

      if (!refresh_token) {
        res.status(400).json({
          detail: 'Refresh token is required',
          error_code: 'MISSING_REFRESH_TOKEN',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Attempt to refresh the token
      const result = await TokenRefreshService.refreshToken(refresh_token);

      res.status(200).json({
        access_token: result.accessToken,
        token_type: 'bearer',
        expires_in: 900, // 15 minutes in seconds
        // Optionally include new refresh token if rotation is implemented
        // refresh_token: result.refreshToken
      });
    } catch (error) {
      res.status(401).json({
        detail: 'Invalid or expired refresh token',
        error_code: 'INVALID_REFRESH_TOKEN',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logs out a user by clearing their tokens
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // From the backend perspective in a stateless system, logout is handled by the frontend
    // The backend doesn't store session information to clear

    // In a stateless JWT system, the logout is typically handled by:
    // 1. Frontend clearing the tokens from storage
    // 2. Backend doesn't need to invalidate tokens since they're stateless

    res.status(200).json({
      success: true,
      message: 'Successfully logged out'
    });
  }

  /**
   * Gets the current user's information
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    // This endpoint would be protected by authentication middleware
    // The user ID should already be attached to the request by middleware

    if (!req.userId) {
      res.status(401).json({
        detail: 'User not authenticated',
        error_code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // In a real implementation, you would fetch user details from the database
    // For now, we'll return minimal user information
    res.status(200).json({
      id: req.userId,
      // Additional user details would come from database lookup
      // email, name, etc.
    });
  }

  /**
   * Health check for authentication system
   */
  static async healthCheck(req: Request, res: Response): Promise<void> {
    // Verify that the authentication system is working
    res.status(200).json({
      status: 'ok',
      message: 'Authentication system is operational',
      timestamp: new Date().toISOString()
    });
  }
}