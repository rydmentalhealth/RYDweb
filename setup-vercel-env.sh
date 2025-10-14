#!/bin/bash

# Setup script for Vercel environment variables
# This script helps you set up the required environment variables for deployment

echo "🚀 Vercel Environment Setup Script"
echo "=================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    echo ""
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Generate AUTH_SECRET if not provided
if [ -z "$AUTH_SECRET" ]; then
    echo "🔐 Generating AUTH_SECRET..."
    AUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated AUTH_SECRET: $AUTH_SECRET"
    echo ""
fi

# Get project URL
echo "🌐 Please enter your Vercel project URL (e.g., https://your-project.vercel.app):"
read -p "Project URL: " PROJECT_URL

if [ -z "$PROJECT_URL" ]; then
    echo "❌ Project URL is required"
    exit 1
fi

echo ""
echo "🔧 Setting up environment variables..."

# Set required environment variables
vercel env add AUTH_SECRET production <<< "$AUTH_SECRET"
vercel env add AUTH_URL production <<< "$PROJECT_URL"
vercel env add NODE_ENV production <<< "production"

echo ""
echo "🔐 OAuth Configuration (Optional)"
echo "If you want to enable Google/Apple OAuth, please set these manually:"
echo ""

# Google OAuth
echo "For Google OAuth:"
echo "  vercel env add GOOGLE_CLIENT_ID production"
echo "  vercel env add GOOGLE_CLIENT_SECRET production"
echo ""

# Apple OAuth
echo "For Apple OAuth:"
echo "  vercel env add APPLE_CLIENT_ID production"
echo "  vercel env add APPLE_CLIENT_SECRET production"
echo ""

echo "✅ Basic environment variables set!"
echo ""
echo "📋 Next steps:"
echo "1. Set up OAuth credentials (optional) - see GOOGLE_OAUTH_SETUP.md"
echo "2. Deploy your application: vercel --prod"
echo "3. Test the authentication flow"
echo ""
echo "🔍 To verify your configuration, run:"
echo "   node scripts/verify-auth-config.js"