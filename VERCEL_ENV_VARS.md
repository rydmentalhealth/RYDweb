# Vercel Environment Variables

Add these environment variables to your Vercel project settings:

## Required Environment Variables

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rydadmin-hub.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rydadmin-hub
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rydadmin-hub.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=20289389765
NEXT_PUBLIC_FIREBASE_APP_ID=1:20289389765:web:89e94da7bf396fc946dcac
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-B69WZL3B7Y
```

### NextAuth Configuration
```
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

### Database Configuration
```
DATABASE_URL=your-database-connection-string
```

### Google OAuth (Optional)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Apple OAuth (Optional)
```
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Make sure to set them for Production, Preview, and Development environments
6. Redeploy your project

## Important Notes

- Make sure to replace `your-secret-key-here` with a strong, random secret
- Replace `your-domain.vercel.app` with your actual Vercel domain
- The Firebase configuration is already set up and ready to use
- Database URL should point to your production database