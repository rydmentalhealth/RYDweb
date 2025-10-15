#!/bin/bash

# Deploy Authentication Fix Script
# This script deploys the authentication configuration fixes to Vercel

echo "🚀 Deploying Authentication Fix to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if we're logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

echo "✅ Vercel CLI is ready"

# Set environment variables for production
echo "📝 Setting environment variables..."

# Set AUTH_URL
vercel env add AUTH_URL production <<< "https://rydmentalhealth.org"

# Set NEXTAUTH_URL  
vercel env add NEXTAUTH_URL production <<< "https://rydmentalhealth.org"

# Set AUTH_SECRET
vercel env add AUTH_SECRET production <<< "K8f3ks+Eoyz3oL4dBtzg5cQoZP2I9E92CBHkW07zN9s="

# Set Google OAuth credentials
vercel env add GOOGLE_CLIENT_ID production <<< "35661944059-9iv0a5pbpkm18l2dm610a9j0pupvlcke.apps.googleusercontent.com"
vercel env add GOOGLE_CLIENT_SECRET production <<< "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"

# Set NODE_ENV
vercel env add NODE_ENV production <<< "production"

echo "✅ Environment variables set"

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your Google OAuth configuration in Google Cloud Console:"
echo "   - Go to: https://console.cloud.google.com/apis/credentials"
echo "   - Edit your OAuth 2.0 Client ID"
echo "   - Add these Authorized JavaScript Origins:"
echo "     • https://rydmentalhealth.org"
echo "     • https://ry-dweb.vercel.app"
echo "     • http://localhost:3000"
echo "   - Add these Authorized Redirect URIs:"
echo "     • https://rydmentalhealth.org/api/auth/callback/google"
echo "     • https://ry-dweb.vercel.app/api/auth/callback/google"
echo "     • http://localhost:3000/api/auth/callback/google"
echo ""
echo "2. Test the authentication flow:"
echo "   - Visit: https://rydmentalhealth.org/login"
echo "   - Try signing in with Google"
echo "   - Check browser console for any errors"
echo ""
echo "3. If you encounter issues, check the Vercel function logs:"
echo "   vercel logs --follow"