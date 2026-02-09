import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <Loader2 className="animate-spin text-gray-500" size={24} />
      <span className="ml-2 text-gray-500 text-sm">Thinking...</span>
    </div>
  );
};
