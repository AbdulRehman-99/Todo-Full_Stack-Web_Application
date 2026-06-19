'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;

    onSend(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-3 bg-white border-t border-surface-100 flex-shrink-0">
      <input
        type="text"
        className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-surface-200 bg-surface-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`p-2.5 rounded-xl text-white font-medium flex items-center justify-center transition-all duration-200 ${
          isLoading || !value.trim()
            ? 'bg-surface-300 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 shadow-sm active:scale-95'
        }`}
        disabled={isLoading || !value.trim()}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Send size={18} />
        )}
      </button>
    </form>
  );
};
