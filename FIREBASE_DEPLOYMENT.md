# Firebase Integration Deployment Guide

This guide explains how to deploy the RYD Admin Hub with Firebase authentication to Vercel.

## Pre-Deployment Checklist

### ✅ 1. Firebase Project Setup
- [x] Firebase project created: `rydadmin-hub`
- [x] Authentication enabled
- [x] Firestore database created
- [x] Security rules configured (temporary open access until Nov 11, 2025)

### ✅ 2. Code Changes
- [x] Firebase SDK installed
- [x] Client-side only Firebase initialization
- [x] Server-side rendering compatibility
- [x] Error handling for SSR

### ✅ 3. Build Verification
- [x] Local build successful
- [x] No server-side Firebase errors
- [x] All components properly marked as client-side

## Deployment Steps

### 1. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 2. Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

#### Required Variables:
```
AUTH_SECRET=your-super-secure-production-secret-at-least-32-characters
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

#### Database Variables (choose one):
```
# For Vercel Postgres:
POSTGRES_URL=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_PRISMA_URL=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb

# OR for external PostgreSQL:
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

#### Optional Variables:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
NEXTAUTH_DEBUG=false
AUTH_DEBUG=false
```

### 3. Set Up Test Accounts in Firebase

After deployment, create test accounts in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `rydadmin-hub` project
3. Go to Authentication > Users
4. Click "Add user" and create these accounts:

#### Test Accounts:
- **Admin**: admin@rydadmin.com / admin123
- **Staff**: staff@rydadmin.com / staff123  
- **Volunteer**: volunteer@rydadmin.com / volunteer123
- **Pending**: pending@rydadmin.com / pending123

### 4. Verify Deployment

1. **Test Firebase Login**:
   - Go to `https://your-domain.vercel.app/firebase-login`
   - Try logging in with test accounts
   - Verify redirect to Firebase dashboard

2. **Test NextAuth Login**:
   - Go to `https://your-domain.vercel.app/login`
   - Verify existing authentication still works
   - Test the "Login with Firebase" button

3. **Test Both Systems**:
   - Verify both authentication methods work independently
   - Test user roles and permissions
   - Verify proper error handling

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Ensure all Firebase components are marked as client-side
   - Check for server-side Firebase imports
   - Verify environment variables are set

2. **Firebase Auth Errors**:
   - Check Firebase project configuration
   - Verify domain is added to authorized domains
   - Check browser console for detailed errors

3. **Database Connection Issues**:
   - Verify database URL is correct
   - Check if database is accessible from Vercel
   - Run Prisma migrations if needed

### Debug Mode:

Enable debug logging by setting:
```
NEXTAUTH_DEBUG=true
AUTH_DEBUG=true
```

## Security Considerations

1. **Firebase Security Rules**:
   - Current rules allow open access until Nov 11, 2025
   - Implement proper security rules before expiration
   - Consider user-based access control

2. **Environment Variables**:
   - Keep AUTH_SECRET secure and unique
   - Don't commit sensitive data to version control
   - Use Vercel's environment variable management

3. **Domain Configuration**:
   - Add your production domain to Firebase authorized domains
   - Configure CORS settings if needed

## Post-Deployment

1. **Monitor Performance**:
   - Check Vercel analytics
   - Monitor Firebase usage
   - Watch for errors in logs

2. **User Management**:
   - Create admin accounts
   - Set up proper user roles
   - Configure user permissions

3. **Backup and Recovery**:
   - Set up database backups
   - Document recovery procedures
   - Test backup restoration

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Firebase Console for errors
3. Review browser console for client-side errors
4. Verify all environment variables are set correctly

The Firebase integration is now ready for production use! 🚀