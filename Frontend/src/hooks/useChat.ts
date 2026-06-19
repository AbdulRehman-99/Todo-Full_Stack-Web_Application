import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import { Message, ChatState, Role, ChatResponse } from '../types/chat';

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    conversationId: null,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Message) => {
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateLastMessage = useCallback((token: string) => {
    setState((prev) => {
      const msgs = [...prev.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + token };
      }
      return { ...prev, messages: msgs };
    });
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

    const aiMessageId = crypto.randomUUID();
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };

    addMessage(aiMessage);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    let resolvedConversationId: number | undefined = state.conversationId || undefined;

    const controller = apiClient.chat.sendChatMessageStream(
      content,
      resolvedConversationId,
      (token) => {
        updateLastMessage(token);
      },
      (newConversationId) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          conversationId: newConversationId,
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
        }));
      }
    );

    abortRef.current = controller;
  }, [state.conversationId, addMessage, updateLastMessage]);

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
