#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}      RYD Admin - Vercel Deployment Script       ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed. Please install it first:${NC}"
    echo -e "   ${BLUE}npm install -g vercel${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI is installed${NC}"

# Check if we can build the project
echo -e "${BLUE}🔍 Testing production build...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix the errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Check for environment variables template
if [ ! -f ".env.production.template" ]; then
    echo -e "${YELLOW}⚠️  Creating environment variables template...${NC}"
    cat > .env.production.template << 'EOF'
# Production Environment Variables Template
# Add these to your Vercel project settings

# NextAuth Configuration (REQUIRED)
AUTH_SECRET=your-super-secure-production-secret-at-least-32-characters
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production

# Database Configuration (REQUIRED - choose one)
# For Vercel Postgres:
POSTGRES_URL=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_PRISMA_URL=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb

# OR for external PostgreSQL:
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret

# Optional: Debug (set to false in production)
NEXTAUTH_DEBUG=false
AUTH_DEBUG=false
EOF
fi

echo ""
echo -e "${BLUE}📋 Pre-deployment checklist:${NC}"
echo -e "   ${GREEN}✅${NC} Build is working"
echo -e "   ${GREEN}✅${NC} Environment template created"
echo ""
echo -e "${YELLOW}Before deploying, make sure you have:${NC}"
echo -e "   📝 Set up a PostgreSQL database (Vercel Postgres or external)"
echo -e "   🔑 Generated a secure AUTH_SECRET (at least 32 characters)"
echo -e "   🌐 Configured all environment variables in Vercel"
echo -e "   📚 Read the VERCEL_DEPLOYMENT.md guide"
echo ""

read -p "Do you want to continue with deployment? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled. Please complete the setup first.${NC}"
    exit 0
fi

echo -e "${BLUE}🚀 Starting Vercel deployment...${NC}"

# Login to Vercel (if not already logged in)
echo -e "${BLUE}Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to Vercel:${NC}"
    vercel login
fi

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}==================================================${NC}"
    echo -e "${GREEN}     Deployment successful! 🎉                   ${NC}"
    echo -e "${GREEN}==================================================${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "   1. 🗄️  Set up your database and run migrations"
    echo -e "   2. 👤 Create your first admin user"
    echo -e "   3. 🧪 Test your application thoroughly"
    echo -e "   4. 🌐 Configure custom domain (optional)"
    echo ""
    echo -e "See ${BLUE}VERCEL_DEPLOYMENT.md${NC} for detailed post-deployment instructions."
else
    echo -e "${RED}❌ Deployment failed. Please check the errors above.${NC}"
    exit 1
fi 