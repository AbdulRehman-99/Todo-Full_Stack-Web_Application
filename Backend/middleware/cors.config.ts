/**
 * CORS Configuration for Authentication
 * Configures Cross-Origin Resource Sharing policies for secure cross-origin requests
 */

import { NextApiHandler } from 'next';

export interface CorsOptions {
  origin: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

// Default CORS configuration for authentication
const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean) as string[],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Client-Version',
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials',
    'Authorization',
    'X-Client-Version',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * CORS middleware implementation
 */
export function cors(options: CorsOptions = DEFAULT_CORS_OPTIONS): NextApiHandler {
  return (req, res, next) => {
    const origin = req.headers.origin;

    // Set allowed origin
    if (Array.isArray(options.origin)) {
      if (origin && options.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else if (options.origin.includes('*')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      } else {
        // If the origin is not in the allowed list, deny the request
        res.status(403).json({ error: 'Origin not allowed' });
        return;
      }
    } else if (typeof options.origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', options.origin);
    }

    // Set other CORS headers
    res.setHeader('Access-Control-Allow-Methods', options.methods?.join(', ') || 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', options.allowedHeaders?.join(', ') || 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', options.maxAge?.toString() || '86400');

    if (options.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  };
}

/**
 * Enhanced CORS middleware that combines CORS with authentication
 */
export function authenticatedCors(options: CorsOptions = DEFAULT_CORS_OPTIONS): NextApiHandler {
  return (req, res, next) => {
    // Apply CORS headers first
    cors(options)(req, res, () => {});

    // Continue with the request
    next();
  };
}

// Export the default configuration
export default DEFAULT_CORS_OPTIONS;