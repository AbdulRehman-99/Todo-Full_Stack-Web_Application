# Implementation Plan: JWT-based Authentication Integration

**Feature**: 001-auth-integration
**Created**: 2026-01-14
**Status**: Draft
**Spec Reference**: [spec.md](./spec.md)

## Architecture Overview

This plan outlines the implementation of JWT-based authentication that integrates Better Auth with a FastAPI backend, enabling secure communication between frontend and backend while maintaining user data isolation.

### System Components

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│   Frontend  │───▶│ Authentication   │───▶│   Backend   │
│ (Next.js)   │    │ (Better Auth)    │    │ (FastAPI)   │
└─────────────┘    └──────────────────┘    └─────────────┘
```

### Folder Structure
```
Authentication/
├── auth/              # Better Auth configuration
├── tokens/            # JWT settings and utilities
├── middleware/        # Shared auth logic
├── docs/              # Integration documentation
└── CLAUDE.md         # Sub-agent instructions
```

## Implementation Phases

### Phase 1: Authentication Infrastructure Setup
**Objective**: Establish the foundation for JWT-based authentication system

**Tasks**:
1. Set up Better Auth configuration with JWT token issuance
2. Configure JWT token settings (15min access token + 7day refresh token)
3. Implement shared secret management via environment variables
4. Create token validation utilities

**Deliverables**:
- Better Auth configuration file
- JWT utility functions
- Environment variable setup for secrets

**Dependencies**: None

### Phase 2: Backend Authentication Middleware
**Objective**: Implement JWT verification on the FastAPI backend

**Tasks**:
1. Create JWT verification middleware for FastAPI
2. Implement user ID extraction from JWT payloads
3. Develop user-specific data filtering logic
4. Configure CORS policies for cross-origin requests
5. Ensure all existing REST endpoints remain unchanged while adding auth layer

**Deliverables**:
- Authentication middleware
- User data isolation mechanisms
- CORS configuration

**Dependencies**: Phase 1

### Phase 3: Frontend Integration Logic
**Objective**: Enable frontend to handle JWT tokens properly

**Tasks**:
1. Implement JWT token storage and retrieval mechanisms
2. Create HTTP interceptors to attach tokens to API requests
3. Develop token refresh logic for expired access tokens
4. Implement logout functionality (token clearing only)

**Deliverables**:
- Token management utilities
- HTTP request interceptors
- Token refresh mechanisms

**Dependencies**: Phase 1

### Phase 4: Integration & Testing
**Objective**: Connect all components and validate the authentication flow

**Tasks**:
1. Integrate frontend token handling with backend verification
2. Test complete authentication flow (login → token → API access)
3. Verify user data isolation (one user can't access another's data)
4. Test error scenarios (invalid tokens, expired tokens, etc.)
5. Validate CORS functionality

**Deliverables**:
- Integrated authentication system
- End-to-end test results
- Error handling validation

**Dependencies**: Phase 2, Phase 3

## Technical Specifications

### JWT Configuration
- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days
- **Algorithm**: RS256 (recommended for security)
- **Secret Storage**: Environment variables (BETTER_AUTH_SECRET)
- **Environment-specific secrets**: Separate configurations for dev/prod/staging

### Token Payload Structure
```json
{
  "user_id": "unique_user_identifier",
  "exp": "expiration_timestamp",
  "iat": "issued_at_timestamp",
  "sub": "subject_identifier"
}
```

### API Authentication Flow
1. User authenticates via Better Auth → receives JWT
2. Frontend stores JWT securely
3. Frontend attaches JWT to all backend API requests in Authorization header
4. Backend verifies JWT signature using shared secret
5. Backend extracts user_id from JWT payload
6. Backend filters data based on authenticated user_id
7. Backend returns user-specific data only

### Error Handling
- Invalid/Expired JWT → HTTP 401 response
- Missing JWT → HTTP 401 response
- Server rejects request → Frontend handles error appropriately
- Token refresh fails → Redirect to login

## Security Considerations

### Token Storage
- Frontend: Store access tokens in HttpOnly cookies for security, refresh tokens in secure storage as needed
- Backend: No token storage (stateless authentication)

### Token Transmission
- All JWTs transmitted via Authorization: Bearer header
- HTTPS required for all authenticated requests
- CORS configured to allow legitimate origins only

### Secret Management
- BETTER_AUTH_SECRET stored in environment variables
- Different secrets per environment (dev/prod/staging)
- Secrets never exposed in client-side code

## Integration Boundaries

### Authentication Component Responsibilities
- Issue JWT tokens upon successful authentication
- Provide token validation utilities
- Manage secret keys for JWT signing/verification
- Document integration patterns

### Frontend Responsibilities
- Store and manage JWT tokens
- Attach tokens to API requests
- Handle token refresh when needed
- Clear tokens on logout

### Backend Responsibilities
- Verify JWT tokens on protected endpoints
- Extract user_id from JWT payload
- Filter data based on authenticated user
- Return HTTP 401 for invalid tokens

## Risk Mitigation

### High-Risk Areas
1. **Secret Management**: Use environment variables and proper CI/CD security
2. **Token Storage**: Implement secure storage to prevent XSS attacks
3. **Cross-Origin Requests**: Proper CORS configuration to prevent CSRF

### Contingency Plans
1. If JWT algorithm causes compatibility issues → Fall back to HS256
2. If token refresh causes UX issues → Implement silent refresh
3. If CORS configuration is complex → Use reverse proxy approach

## Success Criteria Validation

Each phase will be validated against the original success criteria:
- ✅ Better Auth issues JWT on login
- ✅ Frontend sends JWT in Authorization header
- ✅ Backend verifies JWT and extracts user_id
- ✅ All API routes require valid JWT
- ✅ Tasks filtered by authenticated user_id
- ✅ REST endpoints remain unchanged
- ✅ Stateless auth (no backend sessions)
- ✅ Secret via environment variable (BETTER_AUTH_SECRET)

## Dependencies & Prerequisites

### External Dependencies
- Better Auth library
- FastAPI
- JWT libraries (PyJWT for Python, jose for Node.js)
- Environment variable management tools

### Internal Dependencies
- Existing REST API endpoints (must remain unchanged)
- User database schema (for user_id extraction)
- Frontend HTTP client configuration

## Rollout Strategy

### Development Environment
1. Implement with development-specific secrets
2. Test with mock user data
3. Validate CORS configuration locally

### Production Deployment
1. Deploy authentication infrastructure
2. Configure production secrets
3. Gradually enable for users with fallback options
4. Monitor authentication metrics