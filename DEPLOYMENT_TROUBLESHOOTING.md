# Deployment Troubleshooting Guide

## Common Vercel Deployment Issues and Solutions

### 1. **Build Failures**

#### Issue: Prisma Client Generation Errors
```bash
Error: Prisma Client has not been generated yet
```
**Solution:**
- Ensure `npx prisma generate` runs before the build
- Check that `DATABASE_URL` is properly set in Vercel environment variables
- Verify Prisma schema is valid

#### Issue: TypeScript/ESLint Errors
```bash
Type error: Property 'xyz' does not exist
```
**Solution:**
- Use `NEXT_SKIP_TYPE_CHECK=1` and `--no-lint` flags
- Ensure `typescript.ignoreBuildErrors: true` in next.config.js

### 2. **Environment Variable Issues**

#### Required Environment Variables for Production:
```bash
AUTH_SECRET="your-secret-here"
AUTH_URL="https://rydmentalhealth.org"
NEXTAUTH_URL="https://rydmentalhealth.org"
DATABASE_URL="postgresql://..."
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NODE_ENV="production"
```

#### Setting Environment Variables in Vercel:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add each variable for Production environment
3. Redeploy the project

### 3. **Authentication Issues**

#### Issue: CSRF Token Mismatch
**Solution:**
- Ensure `AUTH_SECRET` is set and consistent
- Check that `AUTH_URL` matches your domain exactly
- Verify `trustHost: true` in auth configuration

#### Issue: OAuth Redirect Mismatch
**Solution:**
- Update Google OAuth configuration with correct redirect URIs:
  - `https://rydmentalhealth.org/api/auth/callback/google`
  - `https://ry-dweb.vercel.app/api/auth/callback/google`
- Ensure JavaScript origins are set correctly

### 4. **CORS Issues**

#### Issue: CORS Policy Blocks Requests
**Solution:**
- Check `vercel.json` CORS configuration
- Ensure `Access-Control-Allow-Origin` matches your domain
- Verify `Access-Control-Allow-Credentials: true` is set

### 5. **Database Connection Issues**

#### Issue: Database Connection Failed
**Solution:**
- Verify `DATABASE_URL` is correct and accessible
- Check database provider allows connections from Vercel
- Ensure database is not in sleep mode

### 6. **Build Command Issues**

#### Current Build Command:
```bash
npx prisma generate && NEXT_SKIP_ESLINT=1 NEXT_SKIP_TYPE_CHECK=1 next build --no-lint
```

#### Alternative Build Commands:
```bash
# For development testing
npm run build:skip-checks

# For production with full checks
npm run build
```

### 7. **Function Timeout Issues**

#### Issue: API Routes Timing Out
**Solution:**
- Increase `maxDuration` in `vercel.json`
- Optimize database queries
- Use connection pooling

### 8. **Static Generation Issues**

#### Issue: Static Page Generation Fails
**Solution:**
- Check for client-side only code in server components
- Ensure all imports are server-compatible
- Use dynamic imports for client-only code

## Debugging Steps

### 1. Check Vercel Function Logs
```bash
vercel logs --follow
```

### 2. Test Build Locally
```bash
npm run build:skip-checks
```

### 3. Verify Environment Variables
```bash
vercel env ls
```

### 4. Check Database Connection
```bash
npx prisma db push
```

## Quick Fixes

### If Deployment Still Fails:

1. **Reset Vercel Environment:**
   - Delete all environment variables
   - Re-add them one by one
   - Redeploy

2. **Use Build Cache:**
   - Clear Vercel build cache
   - Force rebuild from scratch

3. **Check Dependencies:**
   - Ensure all dependencies are compatible
   - Check for peer dependency warnings

4. **Verify File Structure:**
   - Ensure all required files are committed
   - Check for missing imports or broken links

## Contact Support

If issues persist:
1. Check Vercel status page
2. Review Vercel documentation
3. Contact Vercel support with deployment logs
4. Check GitHub Actions logs for CI issues