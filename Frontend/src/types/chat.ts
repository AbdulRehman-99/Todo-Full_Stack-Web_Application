export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string | Date; // Backend sends ISO string
}

export interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: number;
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: number | null;
  error: string | null;
}