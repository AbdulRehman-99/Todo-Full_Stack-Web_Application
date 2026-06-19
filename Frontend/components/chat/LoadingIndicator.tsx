'use client';

import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce-dot" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce-dot" style={{ animationDelay: '0.2s' }} />
        <span className="w-2 h-2 rounded-full bg-primary-600 animate-bounce-dot" style={{ animationDelay: '0.4s' }} />
      </div>
      <span className="text-sm text-surface-400">Thinking...</span>
    </div>
  );
};
