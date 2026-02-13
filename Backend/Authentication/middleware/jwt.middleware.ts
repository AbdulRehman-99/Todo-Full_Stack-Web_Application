import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { verifyAccessToken, extractUserIdFromTokenPayload } from '../tokens/jwt-utils';

/**
 * JWT Validation Middleware
 * Validates JWT tokens in the Authorization header and extracts user context
 */

export interface AuthenticatedRequest extends NextApiRequest {
  userId?: string;
}

/**
 * Middleware function to validate JWT and attach user context to request
 */
export function withJwtAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: 'Missing Authorization header',
          error_code: 'MISSING_AUTH_HEADER',
          timestamp: new Date().toISOString()
        });
      }

      // Check if it's a Bearer token
      if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Invalid Authorization header format. Expected: Bearer <token>',
          error_code: 'INVALID_AUTH_FORMAT',
          timestamp: new Date().toISOString()
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify the token
      const tokenPayload = await verifyAccessToken(token);

      // Extract user ID from token
      const userId = extractUserIdFromTokenPayload(tokenPayload);

      // Attach user ID to request object
      req.userId = userId;

      // Call the original handler with the authenticated request
      return handler(req, res);
    } catch (error: any) {
      // Return 401 for any token validation errors
      return res.status(401).json({
        error: error.message || 'Unauthorized: Invalid or expired token',
        error_code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Higher-order function to create protected API routes
 */
export function createProtectedRoute(handler: NextApiHandler): NextApiHandler {
  return withJwtAuth(handler);
}

/**
 * Utility function to check if a request is authenticated
 */
export function isAuthenticated(req: AuthenticatedRequest): boolean {
  return !!req.userId;
}

/**
 * Utility function to get the authenticated user ID
 */
export function getAuthenticatedUserId(req: AuthenticatedRequest): string | null {
  return req.userId || null;
}