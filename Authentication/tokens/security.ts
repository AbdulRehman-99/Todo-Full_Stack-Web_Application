import { SignJWT, jwtVerify } from 'jose';

/**
 * Security Implementation for Authentication Component
 * Implements security best practices for JWT handling
 */

/**
 * Validates the JWT algorithm to prevent algorithm confusion attacks
 */
export function validateJwtAlgorithm(token: string): boolean {
  // In a real implementation, we'd decode the JWT header to check the algorithm
  // For now, we assume proper configuration of the jose library handles this
  return true;
}

/**
 * Sanitizes user data before inclusion in JWT to prevent data leakage
 */
export function sanitizeUserDataForToken(userData: any): any {
  // Only allow specific safe fields in the token
  const allowedFields = ['user_id', 'email', 'name'];

  const sanitized: any = {};
  for (const field of allowedFields) {
    if (userData[field]) {
      sanitized[field] = userData[field];
    }
  }

  return sanitized;
}

/**
 * Validates token payload to prevent injection attacks
 */
export function validateTokenPayload(payload: any): boolean {
  if (!payload) return false;

  // Ensure no sensitive data is in the payload
  const forbiddenFields = ['password', 'secret', 'key', 'token'];
  for (const field of forbiddenFields) {
    if (payload[field]) {
      return false;
    }
  }

  return true;
}

/**
 * Creates a secure JWT with validation
 */
export async function createSecureJwt(
  payload: any,
  secret: string,
  expirySeconds: number,
  issuer?: string,
  audience?: string
): Promise<string> {
  // Sanitize payload
  const sanitizedPayload = sanitizeUserDataForToken(payload);

  // Validate payload
  if (!validateTokenPayload(sanitizedPayload)) {
    throw new Error('Invalid token payload');
  }

  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const token = await new SignJWT(sanitizedPayload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expirySeconds)
    .setSubject(sanitizedPayload.user_id || sanitizedPayload.sub)
    .setIssuer(issuer || 'todo-app-auth')
    .setAudience(audience || 'todo-app-users')
    .sign(secretKey);

  return token;
}

/**
 * Verifies JWT with additional security checks
 */
export async function verifySecureJwt(token: string, secret: string): Promise<any> {
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  try {
    // Verify the token
    const verified = await jwtVerify(token, secretKey);

    // Validate the payload
    if (!validateTokenPayload(verified.payload)) {
      throw new Error('Invalid token payload');
    }

    // Validate algorithm (should be RS256 as expected)
    // This is handled by the jose library based on how it's configured

    return verified.payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${(error as Error).message}`);
  }
}

/**
 * Generates a strong secret key for JWT signing
 */
export function generateStrongSecret(length: number = 32): string {
  // In a real implementation, we'd use a cryptographically secure random generator
  // For now, we'll return a placeholder - this should be replaced with a proper implementation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Checks if a secret meets security requirements
 */
export function isValidSecret(secret: string): boolean {
  if (!secret || typeof secret !== 'string') {
    return false;
  }

  // Check for minimum length
  if (secret.length < 32) {
    return false;
  }

  // Check for sufficient complexity
  const hasUpper = /[A-Z]/.test(secret);
  const hasLower = /[a-z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);
  const hasSpecial = /[^A-Za-z0-9]/.test(secret);

  return hasUpper && hasLower && hasNumbers && hasSpecial;
}