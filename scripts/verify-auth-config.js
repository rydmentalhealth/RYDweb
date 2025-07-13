#!/usr/bin/env node

/**
 * Verification script to check NextAuth.js configuration
 * Run this script to verify your auth setup before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 NextAuth.js Configuration Verification\n');

// Check environment variables
const requiredEnvVars = [
  'AUTH_SECRET',
  'AUTH_URL',
  'NODE_ENV'
];

const optionalEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_DEBUG',
  'DATABASE_URL'
];

console.log('✅ Checking Environment Variables:');

let allRequired = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    if (envVar === 'AUTH_SECRET') {
      const isSecure = value.length >= 32;
      console.log(`  ✅ ${envVar}: ${isSecure ? 'Secure (32+ chars)' : '⚠️  Too short (< 32 chars)'}`);
      if (!isSecure) allRequired = false;
    } else {
      console.log(`  ✅ ${envVar}: Set`);
    }
  } else {
    console.log(`  ❌ ${envVar}: Missing`);
    allRequired = false;
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`  ${value ? '✅' : '⚪'} ${envVar}: ${value ? 'Set' : 'Not set'}`);
});

// Check if lib/auth.ts exists and has the right configuration
console.log('\n🔧 Checking Configuration Files:');

const authFilePath = path.join(process.cwd(), 'lib', 'auth.ts');
if (fs.existsSync(authFilePath)) {
  console.log('  ✅ lib/auth.ts: Found');
  
  const authContent = fs.readFileSync(authFilePath, 'utf8');
  
  // Check for key configurations
  const checks = [
    { pattern: /trustHost:\s*true/, name: 'trustHost set to true' },
    { pattern: /sameSite:\s*"lax"/, name: 'sameSite set to "lax"' },
    { pattern: /__Host-next-auth\.csrf-token/, name: '__Host- cookie prefix for CSRF' },
    { pattern: /AUTH_SECRET.*NEXTAUTH_SECRET/, name: 'AUTH_SECRET with fallback' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(authContent)) {
      console.log(`  ✅ ${check.name}: Configured`);
    } else {
      console.log(`  ⚠️  ${check.name}: Not found`);
    }
  });
} else {
  console.log('  ❌ lib/auth.ts: Not found');
  allRequired = false;
}

// Check middleware
const middlewarePath = path.join(process.cwd(), 'middleware.ts');
if (fs.existsSync(middlewarePath)) {
  console.log('  ✅ middleware.ts: Found');
} else {
  console.log('  ⚪ middleware.ts: Not found (optional)');
}

// Generate summary
console.log('\n📊 Summary:');
if (allRequired) {
  console.log('  🎉 Configuration looks good! Ready for deployment.');
  console.log('\n🚀 Next Steps:');
  console.log('  1. Deploy your application with the environment variables');
  console.log('  2. Test authentication flow in production');
  console.log('  3. Check browser dev tools for proper cookie settings');
  console.log('  4. Monitor logs for any CSRF errors');
} else {
  console.log('  ⚠️  Configuration needs attention before deployment.');
  console.log('\n🔧 Required Actions:');
  console.log('  1. Set missing environment variables');
  console.log('  2. Ensure AUTH_SECRET is at least 32 characters');
  console.log('  3. Re-run this script to verify');
}

console.log('\n🔗 Resources:');
console.log('  • CSRF Fix Guide: ./CSRF_FIX_GUIDE.md');
console.log('  • Generate AUTH_SECRET: openssl rand -base64 32');
console.log('  • NextAuth.js Docs: https://next-auth.js.org/configuration/options');

process.exit(allRequired ? 0 : 1); 