// Task ID: T014 - Create home page (Frontend/app/page.tsx) to display all tasks
// Task ID: T018 - Connect home page to task state management
// Task ID: T019 - Add navigation from Header to home page
'use client';

import { useEffect, useState } from 'react';
import { TaskStatus } from '@/lib/types';
import { useTaskContext } from '@/lib/taskStore';
import TaskList from '@/components/TaskList';
import { isAuthenticated } from '@/src/utils/token-storage';
import { EmbeddableLoginPage as LoginPage, EmbeddableSignupPage as SignupPage } from '@/components/AuthForms'; // Import the embeddable auth components

// Floating login button component
const FloatingLoginButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed top-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
    aria-label="Switch account"
    title="Switch account"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  </button>
);

export default function HomePage() {
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null); // Track which auth form to show
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const { state, loadTasks, toggleComplete, deleteTask, setFilter } = useTaskContext();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsUserAuthenticated(authStatus);

      // If authenticated, load tasks
      if (authStatus) {
        loadTasks();
      }
    };

    checkAuth();
  }, []);

  // Toggle auth form visibility
  const toggleAuth = (authType: 'login' | 'signup' = 'login') => {
    setShowAuth(showAuth === authType ? null : authType);
  };

  // Handle login success
  const handleLoginSuccess = () => {
    setIsUserAuthenticated(true);
    setShowAuth(null);
    // Reload tasks after successful login
    loadTasks();
  };

  // Handle signup success
  const handleSignupSuccess = () => {
    setIsUserAuthenticated(true);
    setShowAuth(null);
    // Reload tasks after successful signup
    loadTasks();
  };

  // If not authenticated, show welcome page
  if (!isUserAuthenticated && showAuth === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Stay Organized, Get Things Done
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              A simple and elegant task management app to help you focus on what matters most.
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={() => setShowAuth('login')}
              className="group relative w-full flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </button>
          </div>

          <div className="text-sm text-gray-500 mt-6">
            <p>Already have an account?{' '}
              <button
                onClick={() => setShowAuth('login')}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show auth form if explicitly requested
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

  // Show loading state while tasks are loading
  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FloatingLoginButton onClick={() => toggleAuth('login')} />
        <div className="text-center py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FloatingLoginButton onClick={() => toggleAuth('login')} />
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{state.error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the main task list when authenticated
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <FloatingLoginButton onClick={() => toggleAuth('login')} />
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My Todo List</h1>
        <p className="mt-3 text-lg text-gray-600">
          Manage your tasks efficiently and stay productive
        </p>
      </div>

      <div className="card">
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