"""Simple test for the AI Chatbot Backend Implementation"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the Backend directory to the path so we can import modules correctly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Test the configuration
from Agent.config import Config

def test_config():
    print("Testing configuration...")
    try:
        Config.validate()
        print(f"[OK] Configuration validated successfully")
        print(f"  Model: {Config.GEMINI_MODEL}")
        print(f"  Temperature: {Config.TEMPERATURE}")
        print(f"  Max tokens: {Config.MAX_OUTPUT_TOKENS}")
    except ValueError as e:
        print(f"[ERROR] Configuration error: {e}")
        return False
    return True

# Test imports
def test_imports():
    print("\nTesting imports...")
    try:
        from mcp.base_tool import BaseMCPTaskTool
        print("[OK] MCP Base Tool imported successfully")

        from mcp.task_tools import AddTaskTool, ListTasksTool, UpdateTaskTool, CompleteTaskTool, DeleteTaskTool
        print("[OK] MCP Task Tools imported successfully")

        from mcp.server import MCPServer
        print("[OK] MCP Server imported successfully")

        from Model.conversation_models import ConversationTask, Conversation, Message
        print("[OK] Conversation models imported successfully")

        from Agent.agent import todo_agent, process_user_message
        print("[OK] AI Agent imported successfully")

        from Agent.runner import AgentRunner
        print("[OK] Agent Runner imported successfully")

        from services.ai_chat_service import AIChatService
        print("[OK] AI Chat Service imported successfully")

        from chat.endpoints import router
        print("[OK] Chat endpoints imported successfully")

        return True
    except ImportError as e:
        print(f"[ERROR] Import error: {e}")
        return False

if __name__ == "__main__":
    print("AI Todo Chatbot Backend - Implementation Test")
    print("=" * 50)

    config_ok = test_config()
    imports_ok = test_imports()

    print("\n" + "=" * 50)
    if config_ok and imports_ok:
        print("[SUCCESS] All tests passed! Backend implementation is ready.")
    else:
        print("[FAILURE] Some tests failed. Please check the implementation.")