"use client";

import { useFirebaseAuth } from '@/components/providers/firebase-auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface FirebaseDashboardGuardProps {
  children: React.ReactNode;
}

export function FirebaseDashboardGuard({ children }: FirebaseDashboardGuardProps) {
  const { user, loading } = useFirebaseAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('[Firebase Dashboard Guard] No user, redirecting to login');
      router.push('/firebase-login');
    } else if (user) {
      console.log('[Firebase Dashboard Guard] User authenticated:', user.email);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}