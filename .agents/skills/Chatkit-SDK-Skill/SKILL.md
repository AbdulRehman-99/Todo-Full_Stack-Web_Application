# SKILL: OpenAI ChatKit SDK

## Purpose
Provide a ready-made chat user interface for interacting
with an AI-powered backend.

## Responsibilities
- Render chat messages
- Handle user input
- Display assistant responses
- Support streaming or non-streaming replies

## Explicit Constraint (CRITICAL)
- ChatKit MUST NOT use its built-in backend
- ChatKit MUST NOT manage AI logic
- ChatKit MUST NOT connect directly to OpenAI APIs
- ChatKit MUST act as a UI-only client

## Backend Integration
- ChatKit sends messages to a custom backend endpoint
- Backend is implemented using FastAPI
- ChatKit does not know how responses are generated

## Data Flow
User Input → ChatKit UI → Custom FastAPI Endpoint
Custom FastAPI Endpoint → ChatKit UI → Render Response

## Authentication Handling
- ChatKit forwards auth headers (JWT / session)
- ChatKit does not implement authentication logic
- Backend validates user identity

## State Management
- ChatKit holds no long-term state
- Conversation state is stored in database
- ChatKit rehydrates chat from backend responses

## Forbidden Usage
- Using ChatKit’s default or hosted backend
- Storing conversation state in frontend memory
- Performing task logic in the UI layer

## When to Use
- Adding chat UI to existing applications
- Connecting AI features to custom backends
- Displaying conversational interfaces

## When NOT to Use
- Backend logic
- AI reasoning
- Database interaction