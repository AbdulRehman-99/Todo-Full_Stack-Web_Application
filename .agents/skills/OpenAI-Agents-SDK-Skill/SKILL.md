# SKILL: OpenAI Agents SDK

## Purpose
Design and operate AI agents using OpenAI Agents SDK for
stateless, tool-driven task execution.

## Responsibilities
- Build AI agents for reasoning and decision making
- Convert natural language into structured actions
- Select and invoke tools based on user intent
- Generate user-facing responses after tool execution

## Usage Rules
- Agents MUST be stateless
- Agents MUST NOT store memory in RAM
- Agents MUST NOT access the database directly
- Agents MUST NOT bypass tool boundaries
- Agents MUST rely on external systems for state

## Integration Pattern
- Input: conversation history + user message
- Processing: intent detection + tool selection
- Output: tool calls + natural language response

## Tool Interaction
- Agents MUST use MCP tools for all side effects
- Agents MUST NOT modify business logic
- Agents MUST validate parameters before tool calls

## Conversation Handling
- Conversation context is provided externally
- Agent assumes no prior memory
- History is rebuilt every request from database

## Error Handling
- Handle tool errors gracefully
- Explain failures in user-friendly language
- Never hallucinate successful actions

## Security Constraints
- Respect authentication context
- Operate only within provided user scope
- Never infer or guess user identity

## When to Use
- Designing AI logic for backend services
- Building reusable agent intelligence
- Implementing tool-based AI workflows

## When NOT to Use
- UI rendering
- Direct database operations
- Authentication logic