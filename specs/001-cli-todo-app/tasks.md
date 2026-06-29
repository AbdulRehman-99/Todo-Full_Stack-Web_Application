# Tasks: CLI Todo Application

**Input**: Design documents from `/specs/001-cli-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /sp.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan in todo-app/
- [X] T002 Create models/, services/, and cli/ directories in todo-app/
- [X] T003 [P] Create main.py entry point file in todo-app/main.py

---
## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Create TodoItem class with id, description, completed, created_at attributes in todo-app/models/todo.py
- [ ] T005 [P] Create in-memory store with todo_list and next_id in todo-app/models/todo.py
- [ ] T006 Create validation rules for TodoItem in todo-app/models/todo.py
- [ ] T007 [P] Create TodoService class in todo-app/services/todo_service.py
- [ ] T008 Create main application loop in todo-app/main.py
- [ ] T009 Create menu interface in todo-app/cli/interface.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Todo Items (Priority: P1) 🎯 MVP

**Goal**: User can add new todo items to their list so they can keep track of tasks they need to complete

**Independent Test**: User can successfully add a new todo item via command line interface and see it displayed in their list.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for add command in todo-app/tests/test_add_contract.py
- [ ] T011 [P] [US1] Integration test for add user journey in todo-app/tests/test_add_integration.py

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement add_todo method in TodoService in todo-app/services/todo_service.py
- [ ] T013 [US1] Implement validation for description length (max 500 chars) in todo-app/models/todo.py
- [ ] T014 [US1] Implement validation for non-empty description in todo-app/models/todo.py
- [ ] T015 [US1] Add add todo functionality to menu interface in todo-app/cli/interface.py
- [ ] T016 [US1] Add menu option 1 for adding todos in todo-app/cli/interface.py
- [ ] T017 [US1] Implement success response "Todo added with ID: {id}" in todo-app/services/todo_service.py
- [ ] T018 [US1] Implement error responses for empty description and character limit in todo-app/services/todo_service.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---
## Phase 4: User Story 2 - View Todo Items (Priority: P1)

**Goal**: User can view their current todo list to see what tasks they have pending

**Independent Test**: User can view all todo items in a clear, readable format via the command line interface.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T019 [P] [US2] Contract test for view/list command in todo-app/tests/test_view_contract.py
- [ ] T020 [P] [US2] Integration test for view user journey in todo-app/tests/test_view_integration.py

### Implementation for User Story 2

- [ ] T021 [P] [US2] Implement get_all_todos method in TodoService in todo-app/services/todo_service.py
- [ ] T022 [US2] Implement view todos functionality to menu interface in todo-app/cli/interface.py
- [ ] T023 [US2] Add menu option 2 for viewing todos in todo-app/cli/interface.py
- [ ] T024 [US2] Implement success response for formatted list or "No todos found" in todo-app/services/todo_service.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---
## Phase 5: User Story 3 - Mark Todo Items Complete (Priority: P2)

**Goal**: User can mark completed tasks so they can track their progress and filter completed items

**Independent Test**: User can mark a specific todo item as complete and verify its status has changed.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T025 [P] [US3] Contract test for complete command in todo-app/tests/test_complete_contract.py
- [ ] T026 [P] [US3] Integration test for complete user journey in todo-app/tests/test_complete_integration.py

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement mark_complete method in TodoService in todo-app/services/todo_service.py
- [ ] T028 [US3] Implement validation for existing todo ID in todo-app/services/todo_service.py
- [ ] T029 [US3] Implement complete todo functionality to menu interface in todo-app/cli/interface.py
- [ ] T030 [US3] Add menu option 5 for marking complete in todo-app/cli/interface.py
- [ ] T031 [US3] Implement success response "Todo {id} marked as complete" in todo-app/services/todo_service.py
- [ ] T032 [US3] Implement error response "Error: Todo with ID {id} not found" in todo-app/services/todo_service.py

**Checkpoint**: At this point, User Stories 1, 2 AND 3 should all work independently

---
## Phase 6: User Story 4 - Update Todo Items (Priority: P2)

**Goal**: User can modify the description of an existing todo item to correct mistakes or update task details

**Independent Test**: User can update the description of an existing todo item and verify the change.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [ ] T033 [P] [US4] Contract test for update command in todo-app/tests/test_update_contract.py
- [ ] T034 [P] [US4] Integration test for update user journey in todo-app/tests/test_update_integration.py

### Implementation for User Story 4

- [ ] T035 [P] [US4] Implement update_todo method in TodoService in todo-app/services/todo_service.py
- [ ] T036 [US4] Implement validation for existing todo ID in todo-app/services/todo_service.py
- [ ] T037 [US4] Implement validation for new description (non-empty, max 500 chars) in todo-app/services/todo_service.py
- [ ] T038 [US4] Implement update todo functionality to menu interface in todo-app/cli/interface.py
- [ ] T039 [US4] Add menu option 3 for updating todos in todo-app/cli/interface.py
- [ ] T040 [US4] Implement success response "Todo {id} updated successfully" in todo-app/services/todo_service.py
- [ ] T041 [US4] Implement error responses for not found and empty description in todo-app/services/todo_service.py

**Checkpoint**: At this point, User Stories 1, 2, 3 AND 4 should all work independently

---
## Phase 7: User Story 5 - Delete Todo Items (Priority: P2)

**Goal**: User can remove items from their todo list when they are no longer needed

**Independent Test**: User can delete a specific todo item and verify it no longer appears in the list.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

- [ ] T042 [P] [US5] Contract test for delete command in todo-app/tests/test_delete_contract.py
- [ ] T043 [P] [US5] Integration test for delete user journey in todo-app/tests/test_delete_integration.py

### Implementation for User Story 5

- [ ] T044 [P] [US5] Implement delete_todo method in TodoService in todo-app/services/todo_service.py
- [ ] T045 [US5] Implement validation for existing todo ID in todo-app/services/todo_service.py
- [ ] T046 [US5] Implement delete todo functionality to menu interface in todo-app/cli/interface.py
- [ ] T047 [US5] Add menu option 4 for deleting todos in todo-app/cli/interface.py
- [ ] T048 [US5] Implement success response "Todo {id} deleted successfully" in todo-app/services/todo_service.py
- [ ] T049 [US5] Implement error response "Error: Todo with ID {id} not found" in todo-app/services/todo_service.py

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T050 [P] Create README.md with usage instructions in todo-app/README.md
- [ ] T051 [P] Implement error handling for invalid commands in todo-app/cli/interface.py
- [ ] T052 [P] Add display of menu options again with error message for invalid commands in todo-app/cli/interface.py
- [ ] T053 Code cleanup and refactoring
- [ ] T054 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3 but should be independently testable
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - May integrate with US1/US2/US3/US4 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for add command in todo-app/tests/test_add_contract.py"
Task: "Integration test for add user journey in todo-app/tests/test_add_integration.py"

# Launch all models for User Story 1 together:
Task: "Implement add_todo method in TodoService in todo-app/services/todo_service.py"
Task: "Implement validation for description length (max 500 chars) in todo-app/models/todo.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence