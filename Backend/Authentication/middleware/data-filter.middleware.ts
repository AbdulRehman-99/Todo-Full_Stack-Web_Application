import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { withJwtAuth, getAuthenticatedUserId, AuthenticatedRequest } from './jwt.middleware';

/**
 * User Data Filtering Middleware
 * Ensures that users can only access their own data by filtering based on authenticated user_id
 */

export interface DataFilteredRequest extends AuthenticatedRequest {
  authenticatedUserId?: string;
}

/**
 * Middleware that validates authentication and ensures data access is limited to authenticated user
 */
export function withUserDataFilter(handler: NextApiHandler): NextApiHandler {
  return withJwtAuth(async (req: DataFilteredRequest, res: NextApiResponse) => {
    // Ensure user ID is available from JWT validation
    if (!req.userId) {
      return res.status(401).json({
        error: 'Authentication required for data access',
        error_code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString()
      });
    }

    // Attach authenticated user ID to request for easy access
    req.authenticatedUserId = req.userId;

    // Call the original handler with the data-filtered request
    return handler(req, res);
  });
}

/**
 * Utility function to verify if a resource belongs to the authenticated user
 */
export function canAccessResource(userId: string, resourceId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

/**
 * Utility function to filter a list of resources to only those owned by the authenticated user
 */
export function filterUserResources<T extends { user_id?: string, userId?: string }>(
  resources: T[],
  authenticatedUserId: string
): T[] {
  return resources.filter(resource => {
    // Check for both snake_case and camelCase user ID fields
    return resource.user_id === authenticatedUserId || resource.userId === authenticatedUserId;
  });
}

/**
 * Utility function to validate that a request parameter matches the authenticated user
 */
export function validateUserParameter(
  req: DataFilteredRequest,
  paramName: string = 'userId'
): boolean {
  const requestedUserId = req.query[paramName] || req.body[paramName];
  const authenticatedUserId = req.authenticatedUserId;

  // If no user parameter is provided, assume it's for the authenticated user
  if (!requestedUserId) {
    return true;
  }

  // If a user parameter is provided, it must match the authenticated user
  return requestedUserId === authenticatedUserId;
}

/**
 * Create a protected route that ensures data isolation
 */
export function createDataProtectedRoute(handler: NextApiHandler): NextApiHandler {
  return withUserDataFilter(handler);
}