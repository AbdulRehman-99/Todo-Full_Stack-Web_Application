# Quickstart Guide: ChatKit Integration

**Feature**: 003-chatkit-integration
**Version**: 1.0

## Overview
This guide explains how to set up and use the ChatKit integration for AI-powered task management in the Todo app.

## Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Next.js 16+ project structure
- Running FastAPI backend with JWT authentication
- Valid Gemini API key in environment variables

## Setup

### 1. Install Dependencies
```bash
cd Frontend
npm install @openai/chatkit-client
```

### 2. Configure Environment Variables
```bash
# In Backend/.env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Extend API Client
Add chat-specific functions to `src/lib/api.ts`:
```typescript
export const sendChatMessage = async (user_id: string, message: string) => {
  return api.post(`/api/${user_id}`, { message });
};
```

## Usage

### 1. Natural Language Task Creation
```
User: "Add a task to buy groceries"
AI: "I've created a task for you: 'buy groceries'"
```

### 2. Task Updates via Chat
```
User: "Update the groceries task to add milk and bread"
AI: "I've updated the task 'buy groceries' to include 'milk and bread'"
```

### 3. Task Completion via Chat
```
User: "Complete the buy groceries task"
AI: "I've marked 'buy groceries' as completed"
```

### 4. Task Deletion via Chat
```
User: "Delete the old appointment task"
AI: "I've deleted the task 'old appointment'"
```

## Key Components

### Frontend Structure
```
Frontend/
├── app/chat/                 # Chat page implementation
├── components/chat/          # Reusable chat components
├── src/lib/chatkit.ts        # ChatKit SDK configuration
├── src/types/chat.ts         # Type definitions
└── src/services/chat.service.ts # Business logic
```

### Backend Integration
```
Backend/
├── mcp/task_tools.py         # MCP task management tools
├── Agent/agent.py           # AI agent with tool integration
├── chat/endpoints.py        # Chat API endpoints
└── services/ai_chat_service.py # AI service orchestration
```

## Authentication Flow
1. User logs in via traditional authentication
2. JWT token is stored in localStorage
3. Token is automatically included in all ChatKit API calls
4. Backend verifies user identity and enforces data isolation
5. MCP tools execute with proper user context

## Troubleshooting

### Common Issues
- **Empty responses**: Check Gemini API key configuration and rate limits
- **Authentication errors**: Verify JWT token is properly stored and sent
- **Tool execution failures**: Confirm MCP server is properly initialized
- **Conversation persistence**: Ensure conversation_id is correctly managed

### Debugging
- Check browser console for frontend errors
- Monitor backend logs for API call issues
- Verify database connectivity for conversation storage
- Confirm proper user context isolation between sessions