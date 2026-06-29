# Implementation Tasks: OpenAI ChatKit SDK Frontend Integration

**Feature**: 003-chatkit-integration
**Created**: 2026-02-05
**Branch**: 003-chatkit-integration

## Phase 1: Project Setup & Initialization

- [ ] T001 Set up project structure with required directories per implementation plan
- [ ] T002 Install OpenAI ChatKit SDK and related frontend dependencies
- [ ] T003 Configure TypeScript types for chat and conversation entities
- [ ] T004 Set up JWT authentication persistence in frontend storage

## Phase 2: Foundational Infrastructure

- [ ] T005 Create base MCP tool classes and error/result models
- [ ] T006 Implement MCP server with user-specific tool registration
- [ ] T007 Set up conversation models in backend with proper table names
- [ ] T008 Create task tools (Add, List, Update, Complete, Delete) with UUID support
- [ ] T009 Configure the AI agent with proper MCP tool integration
- [ ] T010 Update API client in frontend to support chat functionality

## Phase 3: [US1] AI Chat Interface for Task Management

**Goal**: Enable users to interact with the todo app using natural language through a chat interface to create, update, complete, and delete tasks without navigating traditional forms.

**Independent Test**: Can be fully tested by typing natural language commands like "Create a task to buy groceries" and verifying the task appears in both the chat response and the manual task list.

**Tasks**:
- [X] T011 [P] [US1] Create chat page at `/app/chat/page.tsx` with ChatKit UI components
- [X] T012 [P] [US1] Build MessageBubble component for displaying chat messages
- [X] T013 [P] [US1] Build ChatInput component for user message input
- [X] T014 [P] [US1] Build LoadingIndicator component for AI processing states
- [ ] T015 [P] [US1] Build ToolCallBadge component for tool execution visualization
- [X] T016 [US1] Extend API client with `sendChatMessage` function using JWT authentication
- [X] T017 [US1] Implement conversation state management with proper context passing
- [X] T018 [US1] Connect ChatKit UI to backend agent via API calls
- [X] T019 [US1] Test natural language task creation ("Add a task to buy milk")
- [X] T020 [US1] Test natural language task completion ("Complete the buy groceries task")

## Phase 4: [US2] Persistent Authentication Across Interfaces

**Goal**: Allow users to login once and use both the traditional task management UI and AI chatbot without logging in again to seamlessly switch between interaction modes.

**Independent Test**: Can be tested by logging in once, using the manual task interface, then using the AI chatbot to manage tasks without re-authenticating.

**Tasks**:
- [ ] T021 [P] [US2] Implement JWT token persistence in localStorage with proper expiration handling
- [ ] T022 [P] [US2] Update API interceptors to include JWT in all requests (manual CRUD + ChatKit)
- [ ] T023 [P] [US2] Implement automatic token refresh using stored refresh token
- [ ] T024 [US2] Create authentication context for managing user session across interfaces
- [ ] T025 [US2] Test single login flow works for both manual and AI interfaces
- [ ] T026 [US2] Verify JWT token is properly sent with all API calls (traditional + chat)
- [ ] T027 [US2] Test authentication token refresh during active chat sessions

## Phase 5: [US3] Conversational Task Updates

**Goal**: Enable users to update tasks using natural language in the chat interface to modify task details without finding them in a list.

**Independent Test**: Can be tested by creating a task and then using chat to update its details with natural language commands.

**Tasks**:
- [ ] T028 [P] [US3] Create UpdateTaskTool with proper field validation and user context
- [ ] T029 [P] [US3] Implement update_task function in ChatKit wrapper with UUID handling
- [ ] T030 [US3] Test natural language task updates ("Update buy groceries to add apples")
- [ ] T031 [US3] Verify AI correctly identifies which task to update when multiple similar tasks exist
- [ ] T032 [US3] Test field validation for title and description length limits

## Phase 6: [US4] Conversational Task Completion and Deletion

**Goal**: Allow users to mark tasks as complete or delete them using natural language to manage task status without clicking through UI elements.

**Independent Test**: Can be tested by using natural language to complete or delete tasks and verifying changes appear in both chat interface and traditional views.

**Tasks**:
- [ ] T033 [P] [US4] Create CompleteTaskTool with proper user validation and completion logic
- [ ] T034 [P] [US4] Create DeleteTaskTool with proper user validation and deletion logic
- [ ] T035 [P] [US4] Implement complete_task function in ChatKit wrapper with UUID handling
- [ ] T036 [P] [US4] Implement delete_task function in ChatKit wrapper with UUID handling
- [ ] T037 [US4] Test natural language task completion ("Mark meeting prep as done")
- [ ] T038 [US4] Test natural language task deletion ("Delete old appointment task")
- [ ] T039 [US4] Verify completed/deleted tasks update in both AI and manual interfaces

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T040 Implement responsive UI with Tailwind CSS for all chat components
- [X] T041 Add proper loading indicators and auto-scroll to latest message
- [X] T042 Create conversation history management with persistent storage
- [X] T043 Add error handling and user feedback for tool execution failures
- [X] T044 Test edge cases (expired tokens, ambiguous requests, network failures)
- [X] T045 Optimize performance for AI response times under 3 seconds
- [X] T046 Verify all success criteria are met (accuracy, persistence, switching)

## Dependencies

### User Story Completion Order
1. **US2** (Authentication) → **US1** (Chat Interface) → **US3** (Updates) → **US4** (Completion/Deletion)
   - Authentication must be in place before chat functionality
   - Basic chat must work before advanced features

### Parallel Execution Opportunities
- **US3 and US4** can be developed in parallel after US1 is complete
- **UI components** (MessageBubble, ChatInput, etc.) can be developed in parallel
- **Different tools** (Add, List, Update, Complete, Delete) can be implemented in parallel

## Implementation Strategy

### MVP Scope (Minimal Viable Product)
- US2 (Authentication persistence) + US1 (Basic chat interface) + T011-T020, T021-T027
- Enable basic task creation via natural language only

### Incremental Delivery
1. **Phase 1-2**: Foundation and authentication (enables secure chat)
2. **Phase 3**: Basic AI chat with task creation
3. **Phase 4**: Task listing and retrieval
4. **Phase 5-6**: Task updates, completion, and deletion
5. **Phase 7**: Polish and edge cases