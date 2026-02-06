#!/usr/bin/env ts-node

/**
 * Database Setup and Connection Test Script
 * Sets up the database connection and performs initial health checks
 */

import { PrismaClient } from '@prisma/client';
import { databaseHealthMonitor } from '../lib/services/database-health';
import { checkDatabaseConnection } from '../lib/db';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up RYD Staff System Database...\n');

  try {
    // Step 1: Check environment variables
    console.log('1. Checking environment configuration...');
    const requiredEnvVars = ['DATABASE_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      console.log('\n📋 Required environment variables:');
      console.log('   DATABASE_URL - PostgreSQL connection string');
      console.log('   PRISMA_DATABASE_URL - (Optional) Prisma Accelerate URL for better performance');
      console.log('\n💡 Create a .env file with these variables. See .env.example for reference.');
      process.exit(1);
    }
    console.log('   ✅ Environment variables configured\n');

    // Step 2: Test database connection
    console.log('2. Testing database connection...');
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed');
      console.log('\n🔧 Troubleshooting steps:');
      console.log('   1. Verify DATABASE_URL is correct');
      console.log('   2. Ensure database server is running');
      console.log('   3. Check network connectivity');
      console.log('   4. Verify database credentials');
      process.exit(1);
    }
    console.log('   ✅ Database connection successful\n');

    // Step 3: Check database schema
    console.log('3. Checking database schema...');
    try {
      await prisma.user.count({ take: 1 });
      console.log('   ✅ Database schema is ready\n');
    } catch (error) {
      console.warn('   ⚠️  Database schema may need migration');
      console.log('   💡 Run: npx prisma migrate deploy\n');
    }

    // Step 4: Perform comprehensive health check
    console.log('4. Performing comprehensive health check...');
    const healthCheck = await databaseHealthMonitor.performHealthCheck();
    if (!healthCheck.isHealthy) {
      console.error('❌ Health check failed:', healthCheck.error);
      process.exit(1);
    }
    console.log(`   ✅ Health check passed (${healthCheck.responseTime}ms)\n`);

    // Step 5: Test critical queries for staff login
    console.log('5. Testing staff login queries...');
    try {
      // Test user lookup query (critical for login)
      const userCount = await prisma.user.count();
      console.log(`   ✅ User table accessible (${userCount} users)`);

      // Test staff users specifically
      const staffCount = await prisma.user.count({
        where: { role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] } }
      });
      console.log(`   ✅ Staff users found: ${staffCount}`);

      // Test active users
      const activeCount = await prisma.user.count({
        where: { status: 'ACTIVE' }
      });
      console.log(`   ✅ Active users: ${activeCount}\n`);
    } catch (error) {
      console.error('❌ Critical query test failed:', error);
      process.exit(1);
    }

    // Step 6: Start health monitoring
    console.log('6. Starting database health monitoring...');
    databaseHealthMonitor.startMonitoring(30000); // Check every 30 seconds
    console.log('   ✅ Health monitoring started\n');

    // Step 7: Create test staff user if none exist
    console.log('7. Checking for staff users...');
    const existingStaff = await prisma.user.findFirst({
      where: { 
        role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
        status: 'ACTIVE'
      }
    });

    if (!existingStaff) {
      console.log('   ⚠️  No active staff users found');
      console.log('   💡 Consider running: npm run create:staff to create test staff users');
    } else {
      console.log(`   ✅ Active staff user found: ${existingStaff.email}`);
    }
    console.log();

    console.log('🎉 Database setup completed successfully!');
    console.log('📊 Database Health Summary:');
    const summary = databaseHealthMonitor.getHealthSummary();
    console.log(`   - Status: ${summary.isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    console.log(`   - Average Response Time: ${summary.avgResponseTime.toFixed(2)}ms`);
    console.log(`   - Uptime: ${summary.uptime.toFixed(1)}%`);
    console.log();
    console.log('🔗 Staff login should now work properly.');
    console.log('🌐 Access the application at: http://localhost:3000/login');
    
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
    databaseHealthMonitor.stopMonitoring();
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Setup script error:', error);
      process.exit(1);
    });
}

export { setupDatabase };