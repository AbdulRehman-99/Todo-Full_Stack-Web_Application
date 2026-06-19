'use client';

import { useEffect, useState } from 'react';
import { TaskStatus } from '@/lib/types';
import { useTaskContext } from '@/lib/taskStore';
import TaskList from '@/components/TaskList';
import { isAuthenticated } from '@/src/utils/token-storage';
import { EmbeddableLoginPage as LoginPage, EmbeddableSignupPage as SignupPage } from '@/components/AuthForms';
import { CheckSquare, ArrowRight, Sparkles, ListChecks } from 'lucide-react';

const FloatingLoginButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed top-20 right-4 z-40 p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-surface-200 shadow-soft text-surface-600 hover:text-primary-600 hover:bg-white hover:border-primary-200 transition-all duration-200"
    aria-label="Switch account"
    title="Switch account"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  </button>
);

export default function HomePage() {
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { state, loadTasks, toggleComplete, deleteTask, setFilter } = useTaskContext();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsUserAuthenticated(authStatus);

      if (authStatus) {
        loadTasks();
      }
    };

    checkAuth();
  }, []);

  const toggleAuth = (authType: 'login' | 'signup' = 'login') => {
    setShowAuth(showAuth === authType ? null : authType);
  };

  const handleLoginSuccess = () => {
    setIsUserAuthenticated(true);
    setShowAuth(null);
    loadTasks();
  };

  const handleSignupSuccess = () => {
    setIsUserAuthenticated(true);
    setShowAuth(null);
    loadTasks();
  };

  if (!isUserAuthenticated && showAuth === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-surface-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-md w-full px-4 sm:px-6 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 shadow-glow mb-6">
            <CheckSquare size={32} className="text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-900 leading-tight">
            Stay Organized,{' '}
            <span className="gradient-text">Get Things Done</span>
          </h1>
          <p className="mt-4 text-lg text-surface-500 leading-relaxed">
            A simple and elegant task management app to help you focus on what matters most.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={() => setShowAuth('login')}
              className="btn-primary w-full justify-center text-base py-3"
            >
              Get Started
              <ArrowRight size={18} className="ml-2" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-surface-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} />
              Smart AI
            </span>
            <span className="flex items-center gap-1.5">
              <ListChecks size={14} />
              Task Management
            </span>
          </div>

          <div className="mt-8 text-sm text-surface-500">
            Already have an account?{' '}
            <button
              onClick={() => setShowAuth('login')}
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <>
        <FloatingLoginButton onClick={() => toggleAuth()} />
        {showAuth === 'login' ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setShowAuth('signup')}
          />
        ) : (
          <SignupPage
            onSignupSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setShowAuth('login')}
          />
        )}
      </>
    );
  }

  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FloatingLoginButton onClick={() => toggleAuth('login')} />
        <div className="text-center py-16 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-surface-500">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FloatingLoginButton onClick={() => toggleAuth('login')} />
        <div className="card p-6 border-danger-100 bg-danger-50/50 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-danger-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-danger-800">Error</h3>
              <p className="mt-1 text-sm text-danger-600">{state.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FloatingLoginButton onClick={() => toggleAuth('login')} />
      <div className="text-center mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-surface-900 sm:text-4xl">My Todo List</h1>
        <p className="mt-2 text-surface-500">
          Manage your tasks efficiently and stay productive
        </p>
      </div>

      <div className="card p-6">
        <TaskList
          tasks={state.tasks}
          onToggleComplete={toggleComplete}
          onDelete={deleteTask}
          filter={state.filter}
          onFilterChange={setFilter}
        />
      </div>
    </div>
  );
}
