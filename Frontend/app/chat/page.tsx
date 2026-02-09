'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from '../../src/hooks/useChat';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { LoadingIndicator } from '../../components/chat/LoadingIndicator';
import { AlertCircle } from 'lucide-react';

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50 border-x border-gray-200 shadow-sm">
      <header className="p-4 bg-white border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Todo Assistant</h1>
        <div className="text-xs text-gray-500">v1.0</div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">👋 Hi there!</p>
            <p>I can help you manage your tasks. Try saying:</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>"Add a task to buy milk"</li>
              <li>"Show my tasks"</li>
              <li>"Complete the buy milk task"</li>
            </ul>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <LoadingIndicator />}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
            <AlertCircle size={20} />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
