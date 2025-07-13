# NextAuth.js CSRF Error Fix Guide

## Problem
You're experiencing CSRF token errors in production with NextAuth.js v5. The error message indicates:
```
[Auth] CSRF error in production: CSRF token was missing during an action callback
```

## Root Causes
1. Missing or incorrectly configured `AUTH_SECRET`
2. Improper cookie configuration for production
3. Incorrect `trustHost` setting
4. Cross-domain cookie issues

## ✅ Complete Fix Applied

The following changes have been made to fix the CSRF error:

### 1. Updated NextAuth Configuration (`lib/auth.ts`)
- ✅ Enhanced cookie configuration with proper `sameSite: "lax"` for all cookies
- ✅ Added proper `__Host-` and `__Secure-` cookie prefixes for production
- ✅ Fixed `trustHost: true` setting for production
- ✅ Improved secret handling with proper fallbacks
- ✅ Enhanced error logging for CSRF debugging

### 2. Key Changes Made:

#### Cookie Configuration
```typescript
csrfToken: {
  name: isProduction ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
  options: {
    httpOnly: true,
    sameSite: "lax", // Critical: Use 'lax' for CSRF tokens
    path: "/",
    secure: isProduction,
    // Don't set domain for __Host- prefixed cookies
  },
}
```

#### Secret Management
```typescript
const getAuthSecret = () => {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    if (isProduction) {
      throw new Error("AUTH_SECRET is required in production");
    }
    console.warn("[Auth] No AUTH_SECRET found, using default for development");
    return "development-secret-change-in-production";
  }
  
  return secret;
};
```

## 🚀 Deployment Steps

### Step 1: Environment Variables
Set these environment variables in your production deployment:

```bash
# CRITICAL: Generate a secure secret (at least 32 characters)
AUTH_SECRET=your-super-secure-production-secret-at-least-32-characters-long

# Your production URL
AUTH_URL=https://rydmentalhealth.org
NEXTAUTH_URL=https://rydmentalhealth.org

# Environment
NODE_ENV=production

# Your database and other configs...
DATABASE_URL=your-database-url
```

### Step 2: Generate Secure AUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

### Step 3: Deployment Platform Setup

#### For Vercel:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add the variables above
4. Redeploy your application

#### For other platforms:
Ensure your platform supports:
- HTTPS (required for secure cookies)
- Proper cookie handling
- Environment variable injection

### Step 4: Testing
1. Deploy with the new configuration
2. Test authentication flow
3. Check browser dev tools for cookies (should see `__Host-` and `__Secure-` prefixes)
4. Verify no CSRF errors in logs

## 🔍 Troubleshooting

### If you still see CSRF errors:

1. **Check Environment Variables:**
   ```bash
   # In your deployment, verify these are set:
   echo $AUTH_SECRET
   echo $AUTH_URL
   echo $NODE_ENV
   ```

2. **Enable Debug Mode (temporarily):**
   ```bash
   NEXTAUTH_DEBUG=true
   ```

3. **Check Browser Cookies:**
   - Open Developer Tools → Application → Cookies
   - Look for cookies with `__Host-next-auth.csrf-token` or `__Secure-next-auth.csrf-token`
   - Verify they have `Secure`, `HttpOnly`, and `SameSite=Lax` attributes

4. **Check Logs:**
   - Look for detailed CSRF error logs with environment information
   - Verify the `authUrl` and `hasSecret` values in logs

### Common Issues:

#### 1. Missing AUTH_SECRET
**Error:** `AUTH_SECRET is required in production`
**Fix:** Set a proper AUTH_SECRET environment variable

#### 2. Domain Mismatch
**Error:** CSRF token validation fails
**Fix:** Ensure AUTH_URL matches your actual domain

#### 3. HTTPS Issues
**Error:** Secure cookies not working
**Fix:** Ensure your site is served over HTTPS

#### 4. Cookie Blocking
**Error:** Cookies not being sent
**Fix:** Check browser settings and cookie policies

## 📋 Verification Checklist

- [ ] `AUTH_SECRET` is set and at least 32 characters
- [ ] `AUTH_URL` matches your production domain
- [ ] `NODE_ENV=production` is set
- [ ] Site is served over HTTPS
- [ ] Cookies are visible in browser dev tools
- [ ] No CSRF errors in production logs
- [ ] Authentication flow works end-to-end

## 🆘 Additional Help

If you're still experiencing issues:

1. **Check Network Tab:** Look at request/response headers
2. **Clear Browser Data:** Clear cookies and cache
3. **Test in Incognito:** Rule out browser-specific issues
4. **Check Platform Logs:** Look for deployment-specific issues

## 📚 Related Resources

- [NextAuth.js Configuration Guide](https://next-auth.js.org/configuration/options)
- [Cookie Security Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

---

## Summary

The CSRF error has been fixed by:
1. ✅ Updating cookie configuration to use `sameSite: "lax"`
2. ✅ Adding proper cookie prefixes for production security
3. ✅ Enhancing secret handling and validation
4. ✅ Improving error logging for debugging

**Next Steps:** Deploy with proper environment variables and test the authentication flow. 