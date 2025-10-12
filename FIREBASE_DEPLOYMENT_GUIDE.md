# Firebase Deployment Guide for RYD Admin Hub

## ✅ What's Already Done
- ✅ Firebase configuration files created
- ✅ Environment variables updated
- ✅ Build process working
- ✅ Firebase SDK installed

## 🚀 Manual Deployment Steps

### Step 1: Deploy Firestore Security Rules

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `rydadmin-hub`
3. **Navigate to Firestore Database**
4. **Click on "Rules" tab**
5. **Replace the existing rules** with the content from `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Admin users collection - only authenticated admins can access
    match /adminUsers/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Staff users collection - authenticated staff and admins can access
    match /staffUsers/{userId} {
      allow read, write: if request.auth != null 
        && (request.auth.uid == userId 
            || get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin']);
    }
    
    // Admin dashboard data - only admins can access
    match /adminDashboard/{document} {
      allow read, write: if request.auth != null 
        && get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Staff dashboard data - staff and admins can access
    match /staffDashboard/{document} {
      allow read, write: if request.auth != null 
        && (get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin']
            || get(/databases/$(database)/documents/staffUsers/$(request.auth.uid)).data.role in ['staff', 'manager']);
    }
    
    // User management - only admins can access
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // System settings - only super admins can access
    match /systemSettings/{document} {
      allow read, write: if request.auth != null 
        && get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role == 'super_admin';
    }
    
    // Audit logs - only admins can read, no one can write directly
    match /auditLogs/{logId} {
      allow read: if request.auth != null 
        && get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
      allow write: if false; // Only server-side functions can write audit logs
    }
    
    // Public data that doesn't require authentication (if any)
    match /publicData/{document} {
      allow read: if true;
      allow write: if request.auth != null 
        && get(/databases/$(database)/documents/adminUsers/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Default deny rule for any other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. **Click "Publish"** to deploy the rules

### Step 2: Deploy Firestore Indexes

1. **In the same Firestore Database section**
2. **Click on "Indexes" tab**
3. **Click "Add Index"**
4. **Add the following indexes one by one**:

#### Index 1: Admin Users
- Collection: `adminUsers`
- Fields:
  - `email` (Ascending)
  - `role` (Ascending)

#### Index 2: Staff Users
- Collection: `staffUsers`
- Fields:
  - `email` (Ascending)
  - `role` (Ascending)

#### Index 3: Audit Logs
- Collection: `auditLogs`
- Fields:
  - `timestamp` (Descending)
  - `userId` (Ascending)

#### Index 4: Users
- Collection: `users`
- Fields:
  - `status` (Ascending)
  - `createdAt` (Descending)

### Step 3: Enable Authentication

1. **Go to Authentication** in Firebase Console
2. **Click "Get started"** if not already done
3. **Go to "Sign-in method" tab**
4. **Enable "Email/Password"** authentication
5. **Optionally enable "Google"** sign-in

### Step 4: Test the Setup

1. **Go to your Vercel deployment**
2. **Check if the build is successful**
3. **Test Firebase connection** by visiting your app

## 🔧 Alternative: Using Firebase CLI (If you have access)

If you have Firebase CLI access, you can run these commands:

```bash
# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## 📋 Environment Variables for Production

Make sure to add these environment variables to your Vercel deployment:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rydadmin-hub.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rydadmin-hub
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rydadmin-hub.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=20289389765
NEXT_PUBLIC_FIREBASE_APP_ID=1:20289389765:web:89e94da7bf396fc946dcac
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-B69WZL3B7Y
```

## ✅ Verification Checklist

- [ ] Firestore rules deployed
- [ ] Firestore indexes created
- [ ] Authentication enabled
- [ ] Environment variables set in Vercel
- [ ] Build successful
- [ ] Firebase connection working

## 🆘 Need Help?

If you encounter any issues:
1. Check Firebase Console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firestore database is created
4. Check that authentication is properly configured