"""Simple test to isolate import issues"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing individual imports...")

# Test 1: Configuration
try:
    from Agent.config import Config
    Config.validate()
    print("[OK] Configuration imported and validated")
except Exception as e:
    print(f"[ERROR] Config issue: {e}")

# Test 2: MCP Base Tool
try:
    from mcp.base_tool import BaseMCPTaskTool
    print("[OK] MCP Base Tool imported")
except Exception as e:
    print(f"[ERROR] MCP Base Tool issue: {e}")

# Test 3: MCP Task Tools
try:
    from mcp.task_tools import AddTaskTool, ListTasksTool, UpdateTaskTool, CompleteTaskTool, DeleteTaskTool
    print("[OK] MCP Task Tools imported")
except Exception as e:
    print(f"[ERROR] MCP Task Tools issue: {e}")

# Test 4: MCP Server
try:
    from mcp.server import MCPServer
    print("[OK] MCP Server imported")
except Exception as e:
    print(f"[ERROR] MCP Server issue: {e}")

# Test 5: Individual models (separately)
try:
    from Model.conversation_models import ConversationTask
    print("[OK] ConversationTask model imported")
except Exception as e:
    print(f"[ERROR] ConversationTask model issue: {e}")

try:
    from Model.conversation_models import Conversation
    print("[OK] Conversation model imported")
except Exception as e:
    print(f"[ERROR] Conversation model issue: {e}")

try:
    from Model.conversation_models import Message
    print("[OK] Message model imported")
except Exception as e:
    print(f"[ERROR] Message model issue: {e}")

# Test 6: AI Agent
try:
    from Agent.agent import todo_agent, process_user_message
    print("[OK] AI Agent imported")
except Exception as e:
    print(f"[ERROR] AI Agent issue: {e}")

# Test 7: Agent Runner
try:
    from Agent.runner import AgentRunner
    print("[OK] Agent Runner imported")
except Exception as e:
    print(f"[ERROR] Agent Runner issue: {e}")

# Test 8: AI Chat Service
try:
    from services.ai_chat_service import AIChatService
    print("[OK] AI Chat Service imported")
except Exception as e:
    print(f"[ERROR] AI Chat Service issue: {e}")

# Test 9: Chat Endpoints
try:
    from chat.endpoints import router
    print("[OK] Chat endpoints imported")
except Exception as e:
    print(f"[ERROR] Chat endpoints issue: {e}")

print("Done testing imports.")