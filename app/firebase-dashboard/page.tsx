"use client";

import { FirebaseDashboardGuard } from '@/components/auth/firebase-dashboard-guard';
import { useFirebaseAuth } from '@/components/providers/firebase-auth-provider';
import { signOutUser } from '@/lib/firebase-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield, CheckCircle } from 'lucide-react';

function FirebaseDashboardContent() {
  const { user } = useFirebaseAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RYD Admin Dashboard</h1>
              <p className="text-gray-600">Firebase Authentication</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Display Name</label>
                <p className="text-sm">{user.displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm font-mono text-xs">{user.uid}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Verified</label>
                <div className="flex items-center">
                  {user.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-red-500 mr-1" />
                  )}
                  <span className="text-sm">{user.emailVerified ? 'Verified' : 'Not verified'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Role & Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge 
                    variant={
                      user.status === 'ACTIVE' ? 'default' : 
                      user.status === 'PENDING' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {user.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firebase Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Firebase Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    Successfully authenticated with Firebase
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Authentication Provider</label>
                <p className="text-sm">Firebase Auth</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Database</label>
                <p className="text-sm">Firestore</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Accounts Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Accounts Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Admin Account</h4>
                <p className="text-sm text-gray-600">Email: admin@rydadmin.com</p>
                <p className="text-sm text-gray-600">Password: admin123</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Staff Account</h4>
                <p className="text-sm text-gray-600">Email: staff@rydadmin.com</p>
                <p className="text-sm text-gray-600">Password: staff123</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Volunteer Account</h4>
                <p className="text-sm text-gray-600">Email: volunteer@rydadmin.com</p>
                <p className="text-sm text-gray-600">Password: volunteer123</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Pending Account</h4>
                <p className="text-sm text-gray-600">Email: pending@rydadmin.com</p>
                <p className="text-sm text-gray-600">Password: pending123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FirebaseDashboardPage() {
  return (
    <FirebaseDashboardGuard>
      <FirebaseDashboardContent />
    </FirebaseDashboardGuard>
  );
}