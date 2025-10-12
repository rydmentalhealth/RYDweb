# Firebase Setup for RYD Admin Hub

This document outlines the Firebase configuration for the RYD Admin Hub system.

## Project Information
- **Project Name**: RYDadmin-hub
- **Project ID**: rydadmin-hub
- **Database**: Firestore

## Files Created

### 1. Firebase Configuration Files
- `firebase.json` - Main Firebase configuration
- `.firebaserc` - Project configuration
- `firestore.rules` - Security rules for Firestore
- `firestore.indexes.json` - Database indexes for performance

### 2. Application Integration
- `lib/firebase.ts` - Firebase initialization for Next.js
- `.env.example` - Environment variables template

## Firestore Security Rules

The Firestore rules implement a role-based access control system:

### Collections and Access Levels

1. **adminUsers** - Admin user management
   - Access: Only authenticated admins and super admins
   - Users can only access their own data unless they're admins

2. **staffUsers** - Staff user management
   - Access: Staff members and admins
   - Staff can access their own data, admins can access all

3. **adminDashboard** - Admin dashboard data
   - Access: Only admins and super admins

4. **staffDashboard** - Staff dashboard data
   - Access: Staff, managers, and admins

5. **users** - General user management
   - Access: Only admins and super admins

6. **systemSettings** - System configuration
   - Access: Only super admins

7. **auditLogs** - System audit trail
   - Read: Admins and super admins
   - Write: Only server-side functions (for security)

8. **publicData** - Public information
   - Read: Anyone
   - Write: Only admins and super admins

## Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project
```bash
firebase init firestore
```

### 4. Set up environment variables
Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

### 5. Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Firestore indexes
```bash
firebase deploy --only firestore:indexes
```

## Role Structure

The system supports the following roles:
- **super_admin**: Full system access including system settings
- **admin**: Administrative access to users and dashboards
- **manager**: Staff management capabilities
- **staff**: Basic staff access

## Security Features

1. **Authentication Required**: All operations require valid authentication
2. **Role-Based Access**: Different access levels based on user roles
3. **Data Isolation**: Users can only access their own data unless they have admin privileges
4. **Audit Trail**: All actions are logged for security monitoring
5. **Server-Side Validation**: Critical operations are validated server-side

## Database Indexes

The following indexes are configured for optimal performance:
- Admin users by email and role
- Staff users by email and role
- Audit logs by timestamp and user ID
- Users by status and creation date

## Next Steps

1. Set up Firebase project in the Firebase Console
2. Configure authentication providers
3. Set up the database collections
4. Deploy the rules and indexes
5. Test the authentication flow
6. Implement the admin and staff interfaces

## Troubleshooting

If you encounter issues:
1. Check that all environment variables are properly set
2. Verify Firebase project ID matches `.firebaserc`
3. Ensure Firestore rules are deployed correctly
4. Check Firebase Console for any error logs