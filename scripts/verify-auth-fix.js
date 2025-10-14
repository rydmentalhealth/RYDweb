#!/usr/bin/env node

/**
 * Verify Authentication Configuration Fix
 * This script checks if the authentication configuration is properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Authentication Configuration...\n');

// Check environment variables
const requiredEnvVars = [
  'AUTH_SECRET',
  'AUTH_URL', 
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

console.log('📋 Environment Variables Check:');
let allEnvVarsPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '***' : value}`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    allEnvVarsPresent = false;
  }
});

// Check vercel-env.json
console.log('\n📄 Vercel Environment Configuration:');
try {
  const vercelEnvPath = path.join(__dirname, '..', 'vercel-env.json');
  const vercelEnv = JSON.parse(fs.readFileSync(vercelEnvPath, 'utf8'));
  
  console.log(`✅ AUTH_URL: ${vercelEnv.AUTH_URL}`);
  console.log(`✅ NEXTAUTH_URL: ${vercelEnv.NEXTAUTH_URL}`);
  console.log(`✅ AUTH_SECRET: ${vercelEnv.AUTH_SECRET ? 'Set' : 'Missing'}`);
  console.log(`✅ GOOGLE_CLIENT_ID: ${vercelEnv.GOOGLE_CLIENT_ID ? 'Set' : 'Missing'}`);
  console.log(`✅ GOOGLE_CLIENT_SECRET: ${vercelEnv.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'}`);
  
  // Verify URL consistency
  if (vercelEnv.AUTH_URL === vercelEnv.NEXTAUTH_URL) {
    console.log('✅ AUTH_URL and NEXTAUTH_URL are consistent');
  } else {
    console.log('❌ AUTH_URL and NEXTAUTH_URL are inconsistent');
  }
  
  // Verify correct domain
  if (vercelEnv.AUTH_URL === 'https://rydmentalhealth.org') {
    console.log('✅ AUTH_URL matches expected domain');
  } else {
    console.log('❌ AUTH_URL does not match expected domain (should be https://rydmentalhealth.org)');
  }
  
} catch (error) {
  console.log('❌ Error reading vercel-env.json:', error.message);
}

// Check .env.local
console.log('\n📄 Local Environment Configuration:');
try {
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf8');
    console.log('✅ .env.local file exists');
    
    if (envLocal.includes('AUTH_URL="http://localhost:3000"')) {
      console.log('✅ Local AUTH_URL is correctly set for development');
    } else {
      console.log('❌ Local AUTH_URL is not correctly set');
    }
  } else {
    console.log('❌ .env.local file does not exist');
  }
} catch (error) {
  console.log('❌ Error reading .env.local:', error.message);
}

// Check auth configuration
console.log('\n🔧 Auth Configuration Check:');
try {
  const authPath = path.join(__dirname, '..', 'lib', 'auth.ts');
  const authContent = fs.readFileSync(authPath, 'utf8');
  
  if (authContent.includes('trustHost: true')) {
    console.log('✅ trustHost is enabled for production');
  } else {
    console.log('❌ trustHost is not enabled');
  }
  
  if (authContent.includes('useSecureCookies: isProduction')) {
    console.log('✅ Secure cookies are configured for production');
  } else {
    console.log('❌ Secure cookies are not properly configured');
  }
  
  if (authContent.includes('sameSite: "lax"')) {
    console.log('✅ SameSite is set to "lax" for better compatibility');
  } else {
    console.log('❌ SameSite configuration may need adjustment');
  }
  
} catch (error) {
  console.log('❌ Error reading auth configuration:', error.message);
}

// Check middleware
console.log('\n🛡️ Middleware Configuration Check:');
try {
  const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  if (middlewareContent.includes('new URL("/login", req.url)')) {
    console.log('✅ Middleware redirects to correct login page (/login)');
  } else {
    console.log('❌ Middleware may be redirecting to wrong login page');
  }
  
} catch (error) {
  console.log('❌ Error reading middleware:', error.message);
}

console.log('\n🎯 Expected Google OAuth Configuration:');
console.log('Authorized JavaScript Origins:');
console.log('  - https://rydmentalhealth.org');
console.log('  - https://ry-dweb.vercel.app');
console.log('  - http://localhost:3000');
console.log('\nAuthorized Redirect URIs:');
console.log('  - https://rydmentalhealth.org/api/auth/callback/google');
console.log('  - https://ry-dweb.vercel.app/api/auth/callback/google');
console.log('  - http://localhost:3000/api/auth/callback/google');

console.log('\n✨ Authentication configuration verification complete!');
console.log('\n📝 Next Steps:');
console.log('1. Update your Google OAuth configuration with the URLs above');
console.log('2. Deploy the updated configuration to Vercel');
console.log('3. Test the authentication flow on both domains');