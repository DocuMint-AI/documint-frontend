'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionManager } from '@/lib/auth';
import PageLoader from '@/components/PageLoader';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth' 
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = SessionManager.isLoggedIn();
      setIsAuthenticated(loggedIn);
      
      if (requireAuth && !loggedIn) {
        // Store the attempted URL for redirect after login
        if (pathname !== redirectTo) {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        router.push(redirectTo);
        return;
      }
      
      if (!requireAuth && loggedIn) {
        // If user is logged in and tries to access auth page, redirect to upload
        router.push('/upload');
        return;
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [requireAuth, redirectTo, router, pathname]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (requireAuth && !isAuthenticated) {
    return <PageLoader />;
  }

  if (!requireAuth && isAuthenticated) {
    return <PageLoader />;
  }

  return <>{children}</>;
};

export default AuthGuard;