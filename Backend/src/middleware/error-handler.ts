import { Request, Response, NextFunction } from 'express';

/**
 * Error Handler Middleware for Authentication Components
 * Provides consistent error responses for authentication-related errors
 */

export interface ApiError {
  status: number;
  message: string;
  error_code: string;
  timestamp: string;
  details?: any;
}

/**
 * Standardized error response format
 */
export const sendErrorResponse = (res: Response, error: ApiError): void => {
  res.status(error.status).json({
    detail: error.message,
    error_code: error.error_code,
    timestamp: error.timestamp,
    ...(error.details && { details: error.details })
  });
};

/**
 * Authentication-specific error handler
 */
export const authErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Log the error for debugging (in production, use a proper logger)
  console.error('Authentication error:', err);

  // Handle specific authentication errors
  if (err.message && err.message.includes('Invalid or expired')) {
    sendErrorResponse(res, {
      status: 401,
      message: 'Invalid or expired token',
      error_code: 'TOKEN_INVALID',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (err.message && err.message.includes('Missing Authorization')) {
    sendErrorResponse(res, {
      status: 401,
      message: 'Authorization header required',
      error_code: 'MISSING_AUTH_HEADER',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Default error handling
  sendErrorResponse(res, {
    status: err.status || 500,
    message: err.message || 'Internal server error',
    error_code: err.error_code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
};

/**
 * Generic error wrapper for async functions
 */
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (errors: any[], res: Response): void => {
  sendErrorResponse(res, {
    status: 422,
    message: 'Validation failed',
    error_code: 'VALIDATION_ERROR',
    timestamp: new Date().toISOString(),
    details: errors
  });
};

/**
 * Not found error handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendErrorResponse(res, {
    status: 404,
    message: `Route ${req.originalUrl} not found`,
    error_code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

export default authErrorHandler;