# 🔐 Manual Authentication Setup Guide

## 🚨 **CRITICAL: Environment Variables Setup**

You need to set these environment variables in your **Vercel Dashboard**:

### 1. **Go to Vercel Dashboard**
- Visit: https://vercel.com/dashboard
- Select your project: `ry-dweb`
- Go to **Settings** → **Environment Variables**

### 2. **Set These EXACT Variables**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `AUTH_URL` | `https://rydmentalhealth.org` | Production |
| `NEXTAUTH_URL` | `https://rydmentalhealth.org` | Production |
| `AUTH_SECRET` | `K8f3ks+Eoyz3oL4dBtzg5cQoZP2I9E92CBHkW07zN9s=` | Production |
| `GOOGLE_CLIENT_ID` | `35661944059-9iv0a5pbpkm18l2dm610a9j0pupvlcke.apps.googleusercontent.com` | Production |
| `GOOGLE_CLIENT_SECRET` | `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` | Production |
| `NODE_ENV` | `production` | Production |
| `DATABASE_URL` | `your-database-url-here` | Production |

### 3. **For Development (Local)**
Create `.env.local` file in your project root:
```bash
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="K8f3ks+Eoyz3oL4dBtzg5cQoZP2I9E92CBHkW07zN9s="
GOOGLE_CLIENT_ID="35661944059-9iv0a5pbpkm18l2dm610a9j0pupvlcke.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
NODE_ENV="development"
DATABASE_URL="your-local-database-url"
```

## 🔧 **Google OAuth Configuration**

### 1. **Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/apis/credentials
- Select your OAuth 2.0 Client ID

### 2. **Update Authorized JavaScript Origins**
Add these URLs:
```
https://rydmentalhealth.org
https://ry-dweb.vercel.app
http://localhost:3000
```

### 3. **Update Authorized Redirect URIs**
Add these URLs:
```
https://rydmentalhealth.org/api/auth/callback/google
https://ry-dweb.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

## 🚀 **Deployment Steps**

### 1. **After Setting Environment Variables**
```bash
# Redeploy your Vercel project
vercel --prod
```

### 2. **Test Authentication**
1. Visit: https://rydmentalhealth.org/login
2. Try signing in with Google
3. Check browser console for any errors

## 🔍 **Debugging Steps**

### 1. **Check Console Logs**
Look for these logs in browser console:
```
[Auth] URL Resolution: { ... }
[AuthProvider] Fetching session...
[AuthProvider] Session fetched: true/false
```

### 2. **Check Vercel Function Logs**
```bash
vercel logs --follow
```

### 3. **Verify Environment Variables**
```bash
vercel env ls
```

## ⚠️ **Common Issues & Solutions**

### Issue: `[AuthProvider] Session fetched: false`
**Cause**: Environment variables not set correctly
**Solution**: 
1. Verify all environment variables are set in Vercel
2. Redeploy the project
3. Clear browser cache and cookies

### Issue: OAuth redirect mismatch
**Cause**: Google OAuth configuration doesn't match
**Solution**:
1. Update Google OAuth settings with correct URLs
2. Wait 5-10 minutes for changes to propagate
3. Test again

### Issue: CSRF token errors
**Cause**: AUTH_SECRET not set or inconsistent
**Solution**:
1. Ensure AUTH_SECRET is set in Vercel
2. Use the same secret across all environments
3. Redeploy

## 📋 **Quick Checklist**

- [ ] AUTH_URL set to `https://rydmentalhealth.org`
- [ ] NEXTAUTH_URL set to `https://rydmentalhealth.org`
- [ ] AUTH_SECRET set correctly
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET set
- [ ] Google OAuth redirect URIs updated
- [ ] Project redeployed after changes
- [ ] Browser cache cleared

## 🆘 **If Still Not Working**

1. **Check Vercel Function Logs** for specific errors
2. **Verify Database Connection** is working
3. **Test with a different browser** or incognito mode
4. **Check Network Tab** in browser dev tools for failed requests

The authentication should work once all environment variables are set correctly! 🎉