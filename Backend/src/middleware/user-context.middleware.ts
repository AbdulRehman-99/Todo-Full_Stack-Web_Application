import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractUserIdFromTokenPayload } from '../../../Authentication/tokens/jwt-utils';

/**
 * User Context Injection Middleware for FastAPI/Express
 * Extracts user_id from JWT and attaches to request context
 */

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

/**
 * Middleware to inject user context from JWT into request
 */
export const userContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // For optional authentication, we allow the request to continue without user context
      // If a route requires authentication, it should use the JWT validation middleware
      req.userId = undefined;
      return next();
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        detail: 'Invalid Authorization header format. Expected: Bearer <token>',
        error_code: 'INVALID_AUTH_FORMAT',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token
    verifyAccessToken(token)
      .then(tokenPayload => {
        // Extract user ID from token
        const userId = extractUserIdFromTokenPayload(tokenPayload);

        // Attach user ID to request object
        req.userId = userId;

        // Optionally extract other user properties like role
        if (tokenPayload.role) {
          req.userRole = tokenPayload.role;
        }

        next();
      })
      .catch(error => {
        return res.status(401).json({
          detail: error.message || 'Unauthorized: Invalid or expired token',
          error_code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString()
        });
      });

  } catch (error) {
    return res.status(500).json({
      detail: 'Internal server error during authentication',
      error_code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Utility function to check if a user is authenticated
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!req.userId;
};

/**
 * Utility function to get the authenticated user ID
 */
export const getAuthenticatedUserId = (req: Request): string | undefined => {
  return req.userId;
};

/**
 * Utility function to check if the authenticated user has a specific role
 */
export const hasRole = (req: Request, role: string): boolean => {
  return req.userRole === role;
};