import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { Message } from '../../src/types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        <div className={`p-2 rounded-full ${isUser ? 'bg-blue-600' : 'bg-gray-600'} text-white`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        <div
          className={`p-3 rounded-lg ${
            isUser ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};
