from typing import Dict, Any, List
from sqlmodel import Session
from Agent.runner import agent_runner
from Model.conversation_models import Message, Conversation, RoleType, ConversationTask
from sqlmodel import select
from datetime import datetime


class AIChatService:
    """
    Service class to orchestrate the AI chat functionality.
    Handles conversation management, message persistence, and AI agent integration.
    """

    def __init__(self):
        self.agent_runner = agent_runner

    async def process_chat_message(
        self,
        user_id: str,
        message_content: str,
        conversation_id: int = None,
        session: Session = None
    ) -> Dict[str, Any]:
        """
        Process a chat message through the AI agent and return a response.

        Args:
            user_id: The ID of the authenticated user
            message_content: The message from the user
            conversation_id: Optional conversation ID (creates new if not provided)
            session: Database session for persistence operations

        Returns:
            Dictionary containing the response and conversation information
        """
        # Get or create conversation
        if conversation_id is None:
            conversation = self._create_new_conversation(user_id, session)
            conversation_id = conversation.id
        else:
            conversation = self._validate_conversation_access(user_id, conversation_id, session)

        # Store user's message
        user_message = self._store_message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=RoleType.user,
            content=message_content,
            session=session
        )

        # Get conversation history for context
        conversation_history = self._get_conversation_history(conversation_id, session)

        # Process message with AI agent
        result = await self.agent_runner.run_agent(
            user_message=message_content,
            conversation_history=conversation_history,
            user_id=user_id
        )

        # Store AI's response
        ai_response = result["response"]

        ai_message = self._store_message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=RoleType.assistant,
            content=ai_response,
            session=session
        )

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)
        session.commit()

        return {
            "response": ai_response,
            "conversation_id": conversation_id,
            "timestamp": datetime.utcnow().isoformat(),
            "success": True
        }

    def _create_new_conversation(self, user_id: str, session: Session) -> Conversation:
        """Create a new conversation record."""
        conversation = Conversation(
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        return conversation

    def _validate_conversation_access(self, user_id: str, conversation_id: int, session: Session) -> Conversation:
        """Validate that the user has access to the conversation."""
        conversation = session.exec(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .where(Conversation.user_id == user_id)
        ).first()

        if not conversation:
            raise ValueError("Conversation not found or access denied")

        return conversation

    def _store_message(
        self,
        user_id: str,
        conversation_id: int,
        role: str,
        content: str,
        session: Session
    ) -> Message:
        """Store a message in the database."""
        message = Message(
            user_id=user_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.utcnow()
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        return message

    def _get_conversation_history(self, conversation_id: int, session: Session) -> List[Dict[str, str]]:
        """Retrieve conversation history for context."""
        messages = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        ).all()

        return [
            {
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            }
            for msg in messages
        ]

    async def get_conversation_history(self, user_id: str, conversation_id: int, session: Session) -> List[Dict[str, Any]]:
        """Get the full history of a conversation."""
        # Validate access
        self._validate_conversation_access(user_id, conversation_id, session)

        # Get messages
        messages = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
        ).all()

        return [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            }
            for msg in messages
        ]

    async def get_user_conversations(self, user_id: str, session: Session) -> List[Dict[str, Any]]:
        """Get all conversations for a user."""
        conversations = session.exec(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        ).all()

        return [
            {
                "id": conv.id,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat()
            }
            for conv in conversations
        ]


# Global instance of the AI chat service
ai_chat_service = AIChatService()