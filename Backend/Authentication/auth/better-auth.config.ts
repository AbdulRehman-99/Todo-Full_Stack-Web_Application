import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

/**
 * Better Auth Configuration
 * Implements JWT-based authentication with 15min access tokens and 7day refresh tokens
 */
export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "./db.sqlite",
  },
  plugins: [
    jwt({
      secret: process.env.BETTER_AUTH_SECRET || "",
      expiresIn: "15m", // 15 minute access tokens
      refreshExpiresIn: "7d", // 7 day refresh tokens
      algorithm: "RS256", // Using RS256 algorithm for security
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    // No social providers as per requirements
  },
  advanced: {
    generateUserId: () => crypto.randomUUID(),
  },
});