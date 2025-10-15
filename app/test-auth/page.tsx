'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, getSession, getProviders } from 'next-auth/react';

export default function TestAuthPage() {
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
        const debugResponse = await fetch('/api/debug');
        const debugData = await debugResponse.json();
        setDebugInfo(debugData);

        console.log('[TestAuth] Session:', sessionData);
        console.log('[TestAuth] Providers:', providersData);
        console.log('[TestAuth] Debug Info:', debugData);
      } catch (error) {
        console.error('[TestAuth] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      console.log('[TestAuth] Attempting Google sign in...');
      const result = await signIn('google', { 
        callbackUrl: '/test-auth',
        redirect: false 
      });
      console.log('[TestAuth] Sign in result:', result);
    } catch (error) {
      console.error('[TestAuth] Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('[TestAuth] Signing out...');
      await signOut({ callbackUrl: '/test-auth' });
    } catch (error) {
      console.error('[TestAuth] Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading authentication test...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Authentication Debug Test</h1>
      
      {/* Session Status */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Session Status</h2>
        {session ? (
          <div>
            <p style={{ color: 'green' }}>✅ Signed In</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Name:</strong> {session.user?.name}</p>
            <p><strong>Role:</strong> {session.user?.role}</p>
            <p><strong>Status:</strong> {session.user?.status}</p>
            <button onClick={handleSignOut} style={{ padding: '10px', marginTop: '10px' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p style={{ color: 'red' }}>❌ Not Signed In</p>
            <button onClick={handleGoogleSignIn} style={{ padding: '10px', marginTop: '10px' }}>
              Sign In with Google
            </button>
          </div>
        )}
      </div>

      {/* Providers */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Available Providers</h2>
        {providers ? (
          <div>
            {Object.values(providers).map((provider: any) => (
              <div key={provider.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
                <span><strong>{provider.name}</strong></span>
                <span style={{ color: 'green', marginLeft: '10px' }}>✅ Available</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'red' }}>❌ No providers available</p>
        )}
      </div>

      {/* Debug Information */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Debug Information</h2>
        {debugInfo ? (
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        ) : (
          <p style={{ color: 'red' }}>❌ Debug info not available</p>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => window.location.reload()} style={{ padding: '10px' }}>
            Refresh Page
          </button>
          <button 
            onClick={() => window.open('/api/auth/providers', '_blank')}
            style={{ padding: '10px' }}
          >
            Check Providers API
          </button>
          <button 
            onClick={() => window.open('/api/debug', '_blank')}
            style={{ padding: '10px' }}
          >
            Check Debug API
          </button>
        </div>
      </div>
    </div>
  );
}