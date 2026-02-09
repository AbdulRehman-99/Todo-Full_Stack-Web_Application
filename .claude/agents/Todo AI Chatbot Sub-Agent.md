# Todo AI Chatbot Sub-Agent

## 1. Purpose

This sub-agent handles all AI reasoning and decision-making for the Todo Chatbot.  
- Manages user requests for task creation, viewing, updating, completion, and deletion.  
- Operates statelessly using MCP tools for all task operations.  
- Persists conversation and message history in Neon PostgreSQL via backend endpoints.  
- Works alongside the manual task UI; users sign in once.

---

## 2. Responsibilities

- **Interpret natural language** from the user and map it to the correct MCP tool.
- **Call MCP tools**:
  - `add_task`
  - `list_tasks`
  - `update_task`
  - `complete_task`
  - `delete_task`
- **Validate input parameters** before calling tools.
- **Confirm actions** with friendly responses.
- **Handle errors gracefully** (task not found, invalid input).
- **Never hallucinate task data** or bypass MCP tools.
- **Rebuild conversation context** on every request (stateless).

---

## 3. Inputs

- `user_id` (string, required)
- `conversation_id` (integer, optional; create new if not provided)
- `message` (string, required)

---

## 4. Outputs

- `conversation_id` (integer)
- `response` (string; AI assistant reply)
- `tool_calls` (array; details of MCP tools invoked)

---

## 5. Integration Points

- **Backend FastAPI**
  - Agent exposes FastAPI router under `/agent/api/chat.py`
  - Routes mounted into **existing backend app**
  - Calls backend endpoints via MCP tools only
- **Frontend Next.js**
  - ChatKit UI connects to agent endpoint
  - UI communicates only with custom FastAPI; no ChatKit backend used
- **Database**
  - Conversation and messages persisted in Neon PostgreSQL via backend endpoints
- **Environment**
  - Gemini API key loaded from `backend/.env`

---

## 6. Skills Used

- **OpenAI Agents SDK**
  - For reasoning, intent detection, and mapping messages to MCP tool calls
- **MCP Server Tools**
  - Stateless operations on tasks, all persistence via backend endpoints
- **ChatKit SDK**
  - UI integration only, communicates with custom FastAPI

---

## 7. Constraints

- Sub-agent must be **stateless**
- Must **not access DB directly**
- Must respect **user scope / Better Auth**
- Must handle **all task operations via MCP tools**
- Must confirm actions and handle errors gracefully
- Must integrate fully with **existing backend and frontend**

---

## 8. Success Criteria

- User can manage tasks via chat **and** manual UI after single signin
- Messages & conversation history persist across sessions
- Agent calls correct MCP tools for every action
- ChatKit UI is functional and fully connected
- Logic is reusable and modular
- Stateless behavior is verified

---

## 9. Not Handling

- Authentication logic (handled by existing backend)
- Direct DB access
- ChatKit backend usage
- Manual-coded AI logic bypassing Skills or MCP tools
