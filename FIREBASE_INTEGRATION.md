# Firebase Authentication Integration

This document describes the Firebase authentication integration for the RYD Admin Hub.

## Overview

The project now supports both NextAuth (existing) and Firebase Authentication. Users can choose between the two authentication methods.

## Firebase Configuration

The Firebase configuration is located in `/lib/firebase.ts` and uses the following project details:
- Project ID: `rydadmin-hub`
- Auth Domain: `rydadmin-hub.firebaseapp.com`
- Storage Bucket: `rydadmin-hub.firebasestorage.app`

## Features Implemented

### 1. Firebase Authentication Service (`/lib/firebase-auth.ts`)
- Email/password authentication
- User creation with custom roles and status
- Sign out functionality
- Auth state management
- Password reset and email verification

### 2. Firebase Login Page (`/app/firebase-login/page.tsx`)
- Dedicated login page for Firebase authentication
- Clean, modern UI matching the existing design
- Real-time auth state management

### 3. Firebase Dashboard (`/app/firebase-dashboard/page.tsx`)
- Protected dashboard for Firebase-authenticated users
- User information display
- Role and status management
- Test account information

### 4. Firebase Auth Provider (`/components/providers/firebase-auth-provider.tsx`)
- Global auth state management
- React context for Firebase auth state
- Automatic auth state synchronization

### 5. Firebase Dashboard Guard (`/components/auth/firebase-dashboard-guard.tsx`)
- Route protection for Firebase-authenticated users
- Automatic redirect to login if not authenticated
- Loading states

## Test Accounts

The following test accounts are available for testing:

### Admin Account
- **Email:** admin@rydadmin.com
- **Password:** admin123
- **Role:** ADMIN
- **Status:** ACTIVE

### Staff Account
- **Email:** staff@rydadmin.com
- **Password:** staff123
- **Role:** STAFF
- **Status:** ACTIVE

### Volunteer Account
- **Email:** volunteer@rydadmin.com
- **Password:** volunteer123
- **Role:** VOLUNTEER
- **Status:** ACTIVE

### Pending Account
- **Email:** pending@rydadmin.com
- **Password:** pending123
- **Role:** VOLUNTEER
- **Status:** PENDING

## How to Test

### 1. Start the Development Server
```bash
npm run dev
```
The server will run on http://localhost:3001

### 2. Access Firebase Login
Navigate to http://localhost:3001/firebase-login

### 3. Create Test Accounts
You have two options:

#### Option A: Use Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `rydadmin-hub` project
3. Go to Authentication > Users
4. Click "Add user" and create the test accounts manually

#### Option B: Use Browser Console
1. Go to http://localhost:3001/firebase-login
2. Open browser developer tools (F12)
3. Go to Console tab
4. Copy and paste the content from `/scripts/create-test-accounts.js`
5. Run `createTestAccounts()` function

### 4. Test Login
1. Use any of the test account credentials
2. Verify successful login and redirect to dashboard
3. Check user information display
4. Test sign out functionality

## Routes

### Firebase Authentication Routes
- `/firebase-login` - Firebase login page
- `/firebase-dashboard` - Firebase-protected dashboard

### Existing Routes (NextAuth)
- `/login` - NextAuth login page (now includes Firebase option)
- `/dashboard` - NextAuth-protected dashboard

## Database Structure

Firebase Firestore collections:
- `users` - User profiles with roles and status
  - Fields: email, displayName, role, status, createdAt, updatedAt

## Security Rules

The Firestore security rules allow read/write access until November 11, 2025:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 11);
    }
  }
}
```

## Integration with Existing System

The Firebase authentication runs alongside the existing NextAuth system:
- Both authentication methods are available
- Users can choose their preferred login method
- The main login page includes a link to Firebase login
- Both systems use similar user roles and statuses

## Deployment

The Firebase integration is ready for deployment. The configuration uses production Firebase project settings and will work in both development and production environments.

## Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all Firebase components are marked as client components with `"use client"`
2. **Auth State Issues**: Check that the FirebaseAuthProvider is properly wrapping the app
3. **Import Errors**: Ensure all Firebase imports use the correct paths

### Debug Mode

Enable Firebase debug logging by setting `NODE_ENV=development` and checking browser console for detailed auth logs.

## Next Steps

1. Test all functionality thoroughly
2. Deploy to preview environment
3. Verify production deployment
4. Consider implementing more advanced Firebase features (social auth, etc.)
5. Add Firebase Admin SDK for server-side operations if needed