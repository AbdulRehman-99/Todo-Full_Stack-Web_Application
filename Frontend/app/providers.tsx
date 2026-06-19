'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { TaskProvider } from '@/lib/taskStore';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <TaskProvider>
      <Header />
      {children}
      {mounted && <ChatWidget />}
    </TaskProvider>
  );
}
