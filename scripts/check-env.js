#!/usr/bin/env node

// Check if required environment variables are set
const requiredEnvVars = [
  'DATABASE_URL',
  'AUTH_URL',
  'AUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('🔍 Checking environment variables...\n');

let allPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('\n🎉 All required environment variables are set!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some environment variables are missing.');
  console.log('Please set them in your Vercel dashboard or local .env file.');
  process.exit(1);
}