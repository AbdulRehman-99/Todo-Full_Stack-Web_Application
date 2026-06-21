'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, MessageCircle, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

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
      {isOpen && (
        <div className="mb-4 w-[400px] max-w-[calc(100vw-2rem)] h-96 z-40 glass-panel flex flex-col overflow-hidden animate-slide-in-up">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Todo Assistant</h3>
                <p className="text-[10px] text-primary-100">AI-powered help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-custom">
            {messages.length === 0 && !isLoading && (
              <div className="text-center mt-8 px-4 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={24} className="text-primary-600" />
                </div>
                <p className="text-sm font-medium text-surface-700 mb-1">Hi! How can I help?</p>
                <p className="text-xs text-surface-400 leading-relaxed">
                  Try: &ldquo;Add a task to buy groceries&rdquo;<br />or &ldquo;What&apos;s on my list?&rdquo;
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && <LoadingIndicator />}

            {error && (
              <div className="text-xs text-danger-600 bg-danger-50 p-2.5 rounded-xl border border-danger-100 text-center">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-surface-800 rotate-0'
            : 'bg-gradient-to-br from-primary-600 to-primary-500 shadow-glow'
        } text-white`}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>
    </div>
  );
};
