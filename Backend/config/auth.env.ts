/**
 * Authentication Environment Configuration
 * Manages environment variables for authentication secrets
 */

// Ensure we have the required environment variables for authentication
export function validateAuthEnvironment(): void {
  const requiredVars = [
    'BETTER_AUTH_SECRET',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required authentication environment variables: ${missingVars.join(', ')}`
    );
  }

  // Validate that the secret meets security requirements
  const secret = process.env.BETTER_AUTH_SECRET;
  if (secret && secret.length < 32) {
    throw new Error(
      'BETTER_AUTH_SECRET must be at least 32 characters long for security'
    );
  }
}

// Export environment variables for authentication
export const AUTH_CONFIG = {
  SECRET: process.env.BETTER_AUTH_SECRET || 'default_secret_for_dev_must_be_32_chars_long_enough',
  ALGORITHM: 'RS256' as const,
  ISSUER: 'todo-app-auth',
  AUDIENCE: 'todo-app-users',
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
};

// Initialize environment validation
validateAuthEnvironment();

export default AUTH_CONFIG;