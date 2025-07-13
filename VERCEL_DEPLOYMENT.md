# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: Choose between Vercel Postgres or external PostgreSQL

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)

1. Go to your Vercel dashboard
2. Navigate to "Storage" → "Create Database" → "Postgres"
3. Choose your region (same as your app for better performance)
4. Copy the connection strings provided

### Option B: External PostgreSQL

Use services like:
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **Aiven** (free tier available)
- **AWS RDS** (paid)

## Step 2: Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

### Required Variables

```
AUTH_SECRET=your-super-secure-production-secret-at-least-32-characters
AUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### Database Variables (Vercel Postgres)

```
POSTGRES_URL=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb
POSTGRES_PRISMA_URL=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:password@ep-xyz.us-east-1.postgres.vercel-storage.com/verceldb
```

### Database Variables (External PostgreSQL)

```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
```

### Optional OAuth Variables

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

## Step 3: Deploy to Vercel

### Method 1: Via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure build settings (auto-detected)
4. Add environment variables
5. Deploy

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 4: Database Migration

After successful deployment:

1. Go to your Vercel project dashboard
2. Navigate to "Functions" tab
3. Find a recent deployment log
4. Run database migration via Vercel CLI:

```bash
# Connect to your project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

## Step 5: Configure Custom Domain (Optional)

1. Go to project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update AUTH_URL and NEXTAUTH_URL with your custom domain

## Troubleshooting

### CSRF Token Issues

- Ensure `AUTH_SECRET` is set and at least 32 characters
- Verify `AUTH_URL` matches your domain exactly
- Check that cookies are properly configured for production

### Database Connection Issues

- Verify all database environment variables are correct
- Ensure your database allows connections from Vercel IPs
- Check if database migrations were run successfully

### Build Failures

- Check that all dependencies are listed in package.json
- Verify Prisma schema is valid
- Ensure TypeScript errors are resolved

## Security Checklist

- [ ] AUTH_SECRET is secure and unique
- [ ] Database credentials are secure
- [ ] OAuth client secrets are properly set
- [ ] HTTPS is enforced
- [ ] Environment variables are not exposed in client-side code

## Post-Deployment Tasks

1. Test authentication flow
2. Verify database operations work
3. Check all API endpoints
4. Test user registration and login
5. Monitor error logs in Vercel dashboard 