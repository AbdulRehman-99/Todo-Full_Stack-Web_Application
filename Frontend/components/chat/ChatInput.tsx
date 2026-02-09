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
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
      <input
        type="text"
        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`p-3 rounded-lg text-white font-medium flex items-center gap-2 ${
          isLoading || !value.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        disabled={isLoading || !value.trim()}
      >
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        Send
      </button>
    </form>
  );
};
