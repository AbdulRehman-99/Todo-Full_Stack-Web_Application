---
name: auth-skill
description: Handle Signup, Signin, password hashing, JWT token management, and Better Auth integration. Use for authentication and authorization tasks.
---

# Authentication Skill

## Instructions

1. **Signup & Signin Flows**
   - Implement secure user registration and login
   - Validate input data (email, password, etc.)
   - Ensure proper error messages without exposing sensitive info

2. **Password Security**
   - Use strong hashing algorithms (bcrypt, argon2)
   - Enforce password strength requirements
   - Never store plain-text passwords

3. **JWT Token Management**
   - Generate access and refresh tokens on login
   - Validate tokens for protected routes
   - Handle token expiration, revocation, and rotation securely

4. **Better Auth Integration**
   - Integrate with Better Auth or equivalent auth providers
   - Ensure seamless login flows with external auth if required
   - Maintain security best practices during integration

## Best Practices
- Follow OWASP authentication guidelines
- Keep authentication logic separate from business logic
- Use TypeScript or Python types for request and response data
- Log authentication events without exposing sensitive details
- Ensure all protected routes validate credentials and tokens
- Test both successful and failing authentication scenarios
