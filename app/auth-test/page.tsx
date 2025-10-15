'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, getSession, getProviders } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthTestPage() {
  const [session, setSession] = useState<any>(null);
  const [providers, setProviders] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get session
        const sessionData = await getSession();
        setSession(sessionData);

        // Get providers
        const providersData = await getProviders();
        setProviders(providersData);

        // Get debug info
        const debugResponse = await fetch('/api/auth/debug');
        const debugData = await debugResponse.json();
        setDebugInfo(debugData);

        console.log('[AuthTest] Session:', sessionData);
        console.log('[AuthTest] Providers:', providersData);
        console.log('[AuthTest] Debug Info:', debugData);
      } catch (error) {
        console.error('[AuthTest] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      console.log('[AuthTest] Attempting Google sign in...');
      const result = await signIn('google', { 
        callbackUrl: '/auth-test',
        redirect: false 
      });
      console.log('[AuthTest] Sign in result:', result);
    } catch (error) {
      console.error('[AuthTest] Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('[AuthTest] Signing out...');
      await signOut({ callbackUrl: '/auth-test' });
    } catch (error) {
      console.error('[AuthTest] Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2">Loading authentication test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Authentication Debug Test</h1>
        
        <div className="grid gap-6">
          {/* Session Status */}
          <Card>
            <CardHeader>
              <CardTitle>Session Status</CardTitle>
              <CardDescription>Current authentication session</CardDescription>
            </CardHeader>
            <CardContent>
              {session ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✅ Signed In</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Role:</strong> {session.user?.role}</p>
                  <p><strong>Status:</strong> {session.user?.status}</p>
                  <Button onClick={handleSignOut} variant="outline" className="mt-4">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-600 font-medium">❌ Not Signed In</p>
                  <Button onClick={handleGoogleSignIn} className="mt-4">
                    Sign In with Google
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Available Providers</CardTitle>
              <CardDescription>OAuth providers configured</CardDescription>
            </CardHeader>
            <CardContent>
              {providers ? (
                <div className="space-y-2">
                  {Object.values(providers).map((provider: any) => (
                    <div key={provider.id} className="flex items-center justify-between p-2 border rounded">
                      <span>{provider.name}</span>
                      <span className="text-green-600">✅ Available</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-600">❌ No providers available</p>
              )}
            </CardContent>
          </Card>

          {/* Debug Information */}
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>Environment and configuration details</CardDescription>
            </CardHeader>
            <CardContent>
              {debugInfo ? (
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              ) : (
                <p className="text-red-600">❌ Debug info not available</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Test authentication flows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Button 
                  onClick={() => window.open('/api/auth/providers', '_blank')}
                  variant="outline"
                >
                  Check Providers API
                </Button>
                <Button 
                  onClick={() => window.open('/api/auth/debug', '_blank')}
                  variant="outline"
                >
                  Check Debug API
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}