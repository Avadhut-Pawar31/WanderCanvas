'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Compass } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#244536]/10 text-[#244536] flex items-center justify-center mx-auto animate-pulse">
            <Compass className="w-6 h-6 animate-spin" />
          </div>
          <p className="font-serif text-sm text-[#292D2A]/70 italic">Loading your journeys...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
