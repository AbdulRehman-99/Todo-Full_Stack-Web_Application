import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Message, ChatState, Role, ChatResponse } from '../types/chat';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    conversationId: null,
    error: null,
  });

  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    };

    addMessage(userMessage);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.chat.sendChatMessage(content, state.conversationId || undefined);
      const data: ChatResponse = response.data;

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        createdAt: new Date(data.timestamp),
      };

      addMessage(aiMessage);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        conversationId: data.conversation_id,
      }));
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to send message',
      }));
    }
  }, [state.conversationId, addMessage]);

  const loadConversation = useCallback(async (conversationId: number) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiClient.chat.getConversationHistory(conversationId);
      const history = response.data; // Assuming backend returns array of messages
      
      const formattedMessages: Message[] = history.map((msg: any) => ({
        id: msg.id || crypto.randomUUID(),
        role: msg.role as Role,
        content: msg.content,
        createdAt: new Date(msg.created_at || msg.timestamp),
      }));

      setState((prev) => ({
        ...prev,
        messages: formattedMessages,
        conversationId,
        isLoading: false,
      }));
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to load conversation',
      }));
    }
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    conversationId: state.conversationId,
    sendMessage,
    loadConversation,
  };
};
