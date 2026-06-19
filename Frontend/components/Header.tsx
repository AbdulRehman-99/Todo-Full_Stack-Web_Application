'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, CheckSquare } from 'lucide-react';
import { logout, isAuthenticated as checkAuth } from '@/src/services/auth.service';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateAuthStatus = () => {
      setIsAuth(checkAuth());
    };
    updateAuthStatus();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('authChange', updateAuthStatus);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('authChange', updateAuthStatus);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuth(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Add Task', href: '/tasks/new' },
  ];

  return (
    <header
      className={`sticky top-0 z-[999] transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-surface-200/50 shadow-sm'
          : 'bg-white/50 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
              <CheckSquare size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">TaskFlow</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAuth && (
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-surface-600 hover:text-danger-600 hover:bg-danger-50"
              >
                <LogOut size={16} className="mr-1.5" />
                Logout
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-all duration-200"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200/50 bg-white/95 backdrop-blur-xl animate-fade-in-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isAuth && (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-base font-medium text-surface-600 hover:bg-danger-50 hover:text-danger-600 transition-all duration-200 flex items-center"
              >
                <LogOut size={18} className="mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
