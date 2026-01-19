# CLAUDE.md - Authentication Sub-Agent Instructions

## Purpose
This file contains instructions for Claude Code when working on the Authentication component of the Todo app. The authentication system implements JWT-based authentication connecting Frontend (Next.js + Better Auth) with Backend (FastAPI).

## Component Overview
- **Component Name**: Authentication
- **Location**: Root project level (Authentication folder)
- **Primary Function**: JWT-based authentication between frontend and backend
- **Technology Stack**: Better Auth, JWT, FastAPI middleware

## Folder Structure
```
Authentication/
├── auth/              # Better Auth configuration
├── tokens/            # JWT settings (secret, expiry, algorithm)
├── middleware/        # Shared auth logic (token parsing rules)
├── docs/              # Auth flow & integration notes
└── CLAUDE.md         # This file - Authentication sub-agent instructions
```

## Behavioral Rules

### Mandatory Actions
1. **Security First**: Always prioritize security when implementing auth features
2. **JWT Standards**: Follow JWT RFC 7519 standards
3. **Stateless Auth**: Maintain stateless authentication (no server-side sessions)
4. **Environment Secrets**: Always use environment variables for secrets (BETTER_AUTH_SECRET)
5. **Token Expiration**: Implement 15min access tokens + 7day refresh tokens
6. **User Isolation**: Ensure data filtering by authenticated user_id
7. **Error Handling**: Return HTTP 401 for invalid/missing JWTs

### Prohibited Actions
1. **No UI Implementation**: Do not implement authentication UI elements here
2. **No Route Changes**: Do not modify existing backend API routes
3. **No Session Storage**: Do not store session state on backend
4. **No Hardcoded Secrets**: Never hardcode secrets in source code
5. **No Cross-Site Scripting**: Prevent token exposure in client-side code

## Implementation Guidelines

### Better Auth Integration
- Configure JWT token issuance
- Set token expiration times (15min access, 7day refresh)
- Use environment-specific secrets
- Ensure compatibility with FastAPI backend

### JWT Configuration
- Algorithm: RS256 (preferred) or HS256
- Include user_id in token payload
- Validate token signatures using shared secret
- Implement proper token refresh mechanisms

### Backend Middleware
- Verify JWT in Authorization header
- Extract user_id from token payload
- Filter data by authenticated user_id
- Return 401 for invalid/missing tokens
- Maintain existing API route interfaces

### Frontend Integration
- Store tokens securely (httpOnly cookies preferred)
- Attach tokens to API requests automatically
- Handle token refresh when needed
- Clear tokens on logout

## Integration Points

### With Frontend (Next.js)
- Receive JWT from Better Auth
- Send JWT with all backend API requests
- Handle authentication state
- Process token refresh

### With Backend (FastAPI)
- Validate JWT tokens
- Extract user_id for data filtering
- Return user-specific data only
- Maintain existing route contracts

## Testing Requirements
- Authentication flow (login → token → API access)
- Token expiration and refresh
- User data isolation
- Error handling (invalid tokens, etc.)
- CORS functionality

## Security Checklist
- [ ] Secrets stored in environment variables
- [ ] Tokens transmitted over HTTPS only
- [ ] No sensitive data in JWT payload
- [ ] Proper CORS configuration
- [ ] Token storage security implemented (HttpOnly cookies for access tokens)
- [ ] Rate limiting considerations addressed

## Error Conditions
- Invalid JWT → HTTP 401
- Expired JWT → HTTP 401 (frontend handles refresh)
- Missing JWT → HTTP 401
- Malformed JWT → HTTP 401
- Server unavailable → Appropriate error handling

## Environment Configuration
- Development: Separate auth secrets
- Production: Production auth secrets
- Staging: Staging auth secrets
- All secrets via environment variables only
