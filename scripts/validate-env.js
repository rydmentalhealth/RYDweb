#!/usr/bin/env node

// Environment variables validation script
const requiredEnvVars = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXTAUTH_URL'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'APPLE_CLIENT_ID',
  'APPLE_CLIENT_SECRET'
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...');
  
  const missing = [];
  const present = [];
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });
  
  // Check optional variables
  const optionalPresent = [];
  optionalEnvVars.forEach(varName => {
    if (process.env[varName]) {
      optionalPresent.push(varName);
    }
  });
  
  console.log(`✅ Required variables present: ${present.length}/${requiredEnvVars.length}`);
  present.forEach(varName => {
    console.log(`   ✓ ${varName}`);
  });
  
  if (missing.length > 0) {
    console.log(`❌ Missing required variables: ${missing.length}`);
    missing.forEach(varName => {
      console.log(`   ✗ ${varName}`);
    });
  }
  
  console.log(`ℹ️  Optional variables present: ${optionalPresent.length}/${optionalEnvVars.length}`);
  optionalPresent.forEach(varName => {
    console.log(`   ✓ ${varName}`);
  });
  
  // Only fail in production
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.log('\n🚨 Environment validation failed!');
    console.log('Please set the missing required environment variables.');
    process.exit(1);
  } else if (missing.length > 0) {
    console.log('\n⚠️  Environment validation warning!');
    console.log('Some required variables are missing, but continuing with build...');
    console.log('Make sure to set these variables in production.');
  } else {
    console.log('\n✅ Environment validation passed!');
  }
}

// Run validation
validateEnvironment();