'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Minus, MessageCircle } from 'lucide-react';
import { useChat } from '../../src/hooks/useChat';
import { useTaskContext } from '../../lib/taskStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, error, sendMessage } = useChat();
  const { loadTasks } = useTaskContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef(isLoading);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Refresh tasks when AI finishes responding
  useEffect(() => {
    if (prevLoadingRef.current && !isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        loadTasks();
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, messages, loadTasks]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Todo Assistant</h3>
                <p className="text-[10px] text-blue-100">Always active</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 mt-10 px-4">
                <p className="text-sm font-medium text-gray-600 mb-2">👋 Hi! How can I help?</p>
                <p className="text-xs">Try: "Add a task to buy groceries" or "What's on my list?"</p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && <LoadingIndicator />}

            {error && (
              <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100 text-center">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-gray-800 rotate-90' : 'bg-blue-600'
        } text-white`}
      >
        {isOpen ? <Minus size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
};
