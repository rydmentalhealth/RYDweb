# 🔍 Authentication Debug Flow

## Step 1: Check Console Logs

Open your browser's Developer Tools (F12) and look for these specific logs:

### Expected Logs:
```
[Auth] URL Resolution: { 
  isProduction: true, 
  AUTH_URL: "https://rydmentalhealth.org", 
  NEXTAUTH_URL: "https://rydmentalhealth.org", 
  VERCEL_URL: undefined, 
  resolvedUrl: "https://rydmentalhealth.org" 
}
[AuthProvider] Fetching session...
[AuthProvider] Session fetched: false
```

### If you DON'T see these logs:
- The environment variables aren't being loaded properly
- The app isn't using the latest deployment

## Step 2: Test Authentication Endpoints

### Test 1: Check if NextAuth is responding
Visit: `https://rydmentalhealth.org/api/auth/providers`

**Expected Response:**
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "https://rydmentalhealth.org/api/auth/signin/google",
    "callbackUrl": "https://rydmentalhealth.org/api/auth/callback/google"
  }
}
```

### Test 2: Check if Google OAuth is configured
Visit: `https://rydmentalhealth.org/api/auth/signin/google`

**Expected Behavior:**
- Should redirect to Google's OAuth consent screen
- If it shows an error, Google OAuth isn't configured properly

## Step 3: Check Network Tab

1. Open Developer Tools → Network Tab
2. Try to sign in
3. Look for failed requests (red entries)
4. Check the response of `/api/auth/signin/google`

## Step 4: Common Issues & Solutions

### Issue A: "Configuration Error"
**Symptoms:** Error page shows "Configuration Error"
**Cause:** Missing or incorrect AUTH_SECRET
**Solution:** 
- Verify AUTH_SECRET is set in Vercel
- Ensure it's the same value everywhere
- Redeploy after setting

### Issue B: "Access Denied"
**Symptoms:** Google OAuth redirects back with error
**Cause:** Google OAuth configuration mismatch
**Solution:**
- Check Google Console redirect URIs
- Ensure they match exactly (no trailing slashes)
- Wait 5-10 minutes for changes to propagate

### Issue C: "CSRF Token Mismatch"
**Symptoms:** CSRF error in console
**Cause:** Cookie/session issues
**Solution:**
- Clear browser cookies for the domain
- Try incognito mode
- Check if cookies are being set

### Issue D: "Invalid Redirect URI"
**Symptoms:** Google shows "Invalid Redirect URI"
**Cause:** Google OAuth redirect URI doesn't match
**Solution:**
- Double-check Google Console settings
- Ensure URI is exactly: `https://rydmentalhealth.org/api/auth/callback/google`

## Step 5: Manual Testing

### Test the Complete Flow:
1. Go to: `https://rydmentalhealth.org/login`
2. Click "Sign in with Google"
3. Complete Google OAuth
4. Check if you're redirected back to the app
5. Check console for session logs

## Step 6: Environment Variable Verification

### Check if variables are actually loaded:
Add this to your browser console on the live site:
```javascript
fetch('/api/auth/providers')
  .then(r => r.json())
  .then(console.log)
```

This will show if the Google provider is configured.

## Step 7: Database Issues

### Check if user is being created:
- Look in your database for new user records
- Check if the OAuth callback is working
- Verify database connection is working

## Quick Fixes to Try:

1. **Clear Everything:**
   - Clear browser cache and cookies
   - Try incognito mode
   - Try different browser

2. **Redeploy:**
   - Force a new deployment in Vercel
   - Wait for it to complete

3. **Check Vercel Logs:**
   - Go to Vercel dashboard → Functions tab
   - Look for error logs during sign-in attempts

4. **Test with Preview URL:**
   - Try signing in on the preview URL first
   - This helps isolate if it's a domain-specific issue

## What to Report Back:

Please share:
1. What you see in the browser console
2. What happens when you visit `/api/auth/providers`
3. What error (if any) you get when clicking "Sign in with Google"
4. Any network errors in the Network tab
5. What you see in Vercel function logs

This will help me pinpoint the exact issue! 🎯