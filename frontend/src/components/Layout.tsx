'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import ApiInitializer from './ApiInitializer';
import { SessionManager } from '@/lib/auth';
import { FileText, Upload, Settings, Brain, Menu, X, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  hideThemeToggle?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideThemeToggle = false }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      setIsInitializing(true);
      try {
        // Initialize and validate session
        const isValid = await SessionManager.initializeSession();
        setIsAuthenticated(isValid);
        
        if (!isValid && SessionManager.getSession()) {
          // Had a session but validation failed - redirect to auth
          console.log('Session invalid, redirecting to login');
          window.location.href = '/auth';
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Workspace', href: '/workspace', icon: Brain },
    { name: 'Docs', href: '/docs', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      {/* Silent API initialization */}
      <ApiInitializer />
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3" onClick={closeMobileMenu}>
              <div className="p-1 md:p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 md:w-6 h-5 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-tight font-documint">
                  {process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block leading-tight">
                  Legal Document Analysis
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {isAuthenticated && navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-800 flex items-center gap-2">
                {!hideThemeToggle && <ThemeToggle />}
                {isAuthenticated && <ProfileDropdown />}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 md:hidden">
              {!hideThemeToggle && <ThemeToggle />}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 animate-slide-up">
              <nav className="px-2 py-3 space-y-1">
                {isAuthenticated && navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {isAuthenticated && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <ProfileDropdown className="w-full" />
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Layout;