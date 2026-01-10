// Task ID: T008 - Create Header component with navigation links
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
          </Link>

          <nav className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname === '/'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              href="/tasks/new"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname === '/tasks/new'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Add Task
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}