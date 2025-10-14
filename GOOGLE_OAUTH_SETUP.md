# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your application.

## Prerequisites

- A Google Cloud Console account
- Your application deployed on Vercel (or your preferred hosting platform)

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Configure the OAuth consent screen if prompted

## Step 2: Configure OAuth Client

1. **Authorized JavaScript origins:**
   - Add your production domain: `https://your-domain.vercel.app`
   - Add your development domain: `http://localhost:3000`

2. **Authorized redirect URIs:**
   - Add: `https://your-domain.vercel.app/api/auth/callback/google`
   - Add: `http://localhost:3000/api/auth/callback/google` (for development)

3. **Note down your credentials:**
   - Client ID (starts with something like `123456789-abcdef...`)
   - Client Secret (starts with `GOCSPX-...`)

## Step 3: Set Environment Variables

### For Vercel Deployment:

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" > "Environment Variables"
4. Add the following variables:

```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
AUTH_SECRET=your-auth-secret-here-minimum-32-characters
AUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### For Local Development:

1. Create a `.env.local` file in your project root
2. Add the same variables as above, but with local URLs:

```
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
AUTH_SECRET=your-auth-secret-here-minimum-32-characters
AUTH_URL=http://localhost:3000
NODE_ENV=development
```

## Step 4: Generate AUTH_SECRET

Generate a secure secret for NextAuth.js:

```bash
openssl rand -base64 32
```

## Step 5: Deploy and Test

1. Deploy your application to Vercel
2. Test the Google sign-in functionality
3. Check the browser console for any errors
4. Verify that users can successfully sign in with Google

## Troubleshooting

### Common Issues:

1. **"Missing required parameter: client_id"**
   - Ensure `GOOGLE_CLIENT_ID` is set in your environment variables
   - Check that the environment variables are properly deployed

2. **"Error 400: invalid_request"**
   - Verify that your redirect URI matches exactly what's configured in Google Console
   - Check that the domain in your redirect URI matches your deployed domain

3. **"Access blocked: Authorization Error"**
   - Ensure your OAuth consent screen is properly configured
   - Check that the domain is added to authorized JavaScript origins
   - Verify that the Google+ API is enabled

4. **OAuth buttons not showing**
   - The application will automatically hide OAuth buttons if credentials are not configured
   - This is expected behavior when OAuth is not set up

### Debug Steps:

1. Check environment variables are loaded:
   ```bash
   node scripts/verify-auth-config.js
   ```

2. Check browser console for errors
3. Verify the OAuth consent screen configuration
4. Test with a different Google account
5. Check Vercel function logs for server-side errors

## Security Notes

- Never commit your `.env.local` file to version control
- Use strong, unique secrets for production
- Regularly rotate your OAuth credentials
- Monitor your OAuth usage in Google Cloud Console

## Support

If you continue to experience issues:

1. Check the [NextAuth.js documentation](https://next-auth.js.org/providers/google)
2. Review the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check your Vercel deployment logs
4. Verify all environment variables are correctly set