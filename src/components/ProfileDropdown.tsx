'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '@/lib/auth';
import ProfileAvatar from './ProfileAvatar';
import { ChevronDown, User, Key, LogOut, Settings } from 'lucide-react';

interface ProfileDropdownProps {
  className?: string;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = '' }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get username from session
    const session = SessionManager.getSession();
    if (session?.username) {
      setUsername(session.username);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    SessionManager.clearSession();
    router.push('/auth');
    setIsOpen(false);
  };

  const handleUpdatePassword = () => {
    // TODO: Implement password update modal
    alert('Password update feature coming soon!');
    setIsOpen(false);
  };

  const handleSettings = () => {
    router.push('/settings');
    setIsOpen(false);
  };

  if (!username) {
    return null; // Don't render if no user session
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button - Clean icon-only design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-all duration-200 border border-white/20 dark:border-gray-600/30"
        aria-label={`Profile menu for ${username}`}
        title={username} // Show username on hover
      >
        <ProfileAvatar username={username} size="md" />
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ml-1 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50 animate-fade-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <ProfileAvatar username={username} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Signed in
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleSettings}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              onClick={handleUpdatePassword}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Key className="w-4 h-4" />
              Update Password
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-gray-600 py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;