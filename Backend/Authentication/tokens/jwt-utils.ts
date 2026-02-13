import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

/**
 * JWT Utilities for Authentication Component
 * Implements JWT RFC 7519 standards with 15min access tokens and 7day refresh tokens
 */

const JWT_ACCESS_EXPIRY = 15 * 60; // 15 minutes in seconds
const JWT_REFRESH_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Creates an access token with 15-minute expiry
 */
export async function createAccessToken(userId: string, email: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.BETTER_AUTH_SECRET || 'default_secret_for_dev'
  );

  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'RS256' })
    .setJti(nanoid()) // JWT ID for identification
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + JWT_ACCESS_EXPIRY)
    .setSubject(userId)
    .setIssuer('better-auth')
    .setAudience('todo-app-users')
    .sign(secret);

  return token;
}

/**
 * Creates a refresh token with 7-day expiry
 */
export async function createRefreshToken(userId: string): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.BETTER_AUTH_SECRET || 'default_secret_for_dev'
  );

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'RS256' })
    .setJti(nanoid()) // JWT ID for identification
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + JWT_REFRESH_EXPIRY)
    .setSubject(userId)
    .setIssuer('better-auth')
    .setAudience('todo-app-users')
    .sign(secret);

  return token;
}

/**
 * Verifies an access token and returns its payload
 */
export async function verifyAccessToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(
      process.env.BETTER_AUTH_SECRET || 'default_secret_for_dev'
    );

    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verifies a refresh token and returns its payload
 */
export async function verifyRefreshToken(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(
      process.env.BETTER_AUTH_SECRET || 'default_secret_for_dev'
    );

    const verified = await jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Extracts user_id from JWT payload
 */
export function extractUserIdFromTokenPayload(payload: any): string {
  if (!payload || !payload.sub) {
    throw new Error('Invalid token: no subject (user_id) found');
  }
  return payload.sub as string;
}

/**
 * Checks if a token is expired based on exp claim
 */
export function isTokenExpired(payload: any): boolean {
  if (!payload.exp) {
    return true; // If no expiration, consider it expired
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}