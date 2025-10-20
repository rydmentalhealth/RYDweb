#!/usr/bin/env ts-node

/**
 * Staff Login Fix Script
 * Diagnoses and fixes common staff login database issues
 */

import { PrismaClient } from '@prisma/client';
import { databaseHealthMonitor } from '../lib/services/database-health';

const prisma = new PrismaClient();

interface LoginIssue {
  type: 'connection' | 'schema' | 'data' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  fix?: string;
  autoFixable: boolean;
}

async function diagnoseStaffLogin(): Promise<LoginIssue[]> {
  const issues: LoginIssue[] = [];
  
  console.log('🔍 Diagnosing staff login issues...\n');

  // 1. Check database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connection: OK');
  } catch (error) {
    issues.push({
      type: 'connection',
      severity: 'critical',
      description: 'Cannot connect to database',
      fix: 'Check DATABASE_URL environment variable and database server status',
      autoFixable: false
    });
    console.log('❌ Database connection: FAILED');
    return issues; // Can't continue without connection
  }

  // 2. Check if User table exists and is accessible
  try {
    await prisma.user.count({ take: 1 });
    console.log('✅ User table: Accessible');
  } catch (error) {
    issues.push({
      type: 'schema',
      severity: 'critical',
      description: 'User table is not accessible',
      fix: 'Run database migration: npx prisma migrate deploy',
      autoFixable: false
    });
    console.log('❌ User table: NOT ACCESSIBLE');
  }

  // 3. Check for staff users
  try {
    const staffCount = await prisma.user.count({
      where: { role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] } }
    });
    
    if (staffCount === 0) {
      issues.push({
        type: 'data',
        severity: 'high',
        description: 'No staff users found in database',
        fix: 'Create staff users using: npm run create:staff',
        autoFixable: true
      });
      console.log('⚠️  Staff users: NONE FOUND');
    } else {
      console.log(`✅ Staff users: ${staffCount} found`);
    }
  } catch (error) {
    console.log('❌ Staff users check: FAILED');
  }

  // 4. Check for active staff users
  try {
    const activeStaffCount = await prisma.user.count({
      where: { 
        role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
        status: 'ACTIVE'
      }
    });
    
    if (activeStaffCount === 0) {
      issues.push({
        type: 'data',
        severity: 'high',
        description: 'No active staff users found',
        fix: 'Activate existing staff users or create new ones',
        autoFixable: true
      });
      console.log('⚠️  Active staff users: NONE FOUND');
    } else {
      console.log(`✅ Active staff users: ${activeStaffCount} found`);
    }
  } catch (error) {
    console.log('❌ Active staff users check: FAILED');
  }

  // 5. Check database performance
  try {
    const startTime = Date.now();
    await prisma.user.findFirst({
      where: { status: 'ACTIVE' }
    });
    const queryTime = Date.now() - startTime;
    
    if (queryTime > 5000) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: `Slow database queries detected (${queryTime}ms)`,
        fix: 'Consider database optimization or using Prisma Accelerate',
        autoFixable: false
      });
      console.log(`⚠️  Query performance: SLOW (${queryTime}ms)`);
    } else {
      console.log(`✅ Query performance: OK (${queryTime}ms)`);
    }
  } catch (error) {
    console.log('❌ Performance check: FAILED');
  }

  // 6. Check for users with missing passwords
  try {
    const usersWithoutPassword = await prisma.user.count({
      where: {
        role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
        password: null
      }
    });
    
    if (usersWithoutPassword > 0) {
      issues.push({
        type: 'data',
        severity: 'medium',
        description: `${usersWithoutPassword} staff users have no password set`,
        fix: 'Set passwords for staff users or enable OAuth login',
        autoFixable: false
      });
      console.log(`⚠️  Users without password: ${usersWithoutPassword} found`);
    } else {
      console.log('✅ User passwords: All staff users have passwords');
    }
  } catch (error) {
    console.log('❌ Password check: FAILED');
  }

  return issues;
}

async function fixStaffLoginIssues(issues: LoginIssue[]): Promise<void> {
  console.log('\n🔧 Attempting to fix issues...\n');

  for (const issue of issues) {
    if (!issue.autoFixable) {
      console.log(`⏭️  Skipping ${issue.description} (manual fix required)`);
      continue;
    }

    console.log(`🔧 Fixing: ${issue.description}`);

    try {
      if (issue.description.includes('No staff users found')) {
        await createDefaultStaffUser();
      } else if (issue.description.includes('No active staff users')) {
        await activateStaffUsers();
      }
      console.log('   ✅ Fixed successfully');
    } catch (error) {
      console.log('   ❌ Fix failed:', error);
    }
  }
}

async function createDefaultStaffUser(): Promise<void> {
  const defaultStaff = {
    email: 'admin@rydmentalhealth.org',
    firstName: 'System',
    lastName: 'Administrator',
    name: 'System Administrator',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    password: '$2a$10$example.hash.for.password123' // This should be properly hashed
  };

  const existing = await prisma.user.findUnique({
    where: { email: defaultStaff.email }
  });

  if (!existing) {
    await prisma.user.create({
      data: defaultStaff
    });
    console.log(`   Created default staff user: ${defaultStaff.email}`);
  } else {
    console.log(`   Staff user already exists: ${defaultStaff.email}`);
  }
}

async function activateStaffUsers(): Promise<void> {
  const result = await prisma.user.updateMany({
    where: {
      role: { in: ['STAFF', 'ADMIN', 'SUPER_ADMIN'] },
      status: { not: 'ACTIVE' }
    },
    data: {
      status: 'ACTIVE'
    }
  });

  console.log(`   Activated ${result.count} staff users`);
}

async function generateReport(issues: LoginIssue[]): Promise<void> {
  console.log('\n📊 STAFF LOGIN DIAGNOSIS REPORT');
  console.log('================================\n');

  if (issues.length === 0) {
    console.log('🎉 No issues found! Staff login should work properly.\n');
    return;
  }

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const mediumIssues = issues.filter(i => i.severity === 'medium');
  const lowIssues = issues.filter(i => i.severity === 'low');

  if (criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES (must fix immediately):');
    criticalIssues.forEach(issue => {
      console.log(`   - ${issue.description}`);
      console.log(`     Fix: ${issue.fix}`);
    });
    console.log();
  }

  if (highIssues.length > 0) {
    console.log('⚠️  HIGH PRIORITY ISSUES:');
    highIssues.forEach(issue => {
      console.log(`   - ${issue.description}`);
      console.log(`     Fix: ${issue.fix}`);
    });
    console.log();
  }

  if (mediumIssues.length > 0) {
    console.log('📋 MEDIUM PRIORITY ISSUES:');
    mediumIssues.forEach(issue => {
      console.log(`   - ${issue.description}`);
      console.log(`     Fix: ${issue.fix}`);
    });
    console.log();
  }

  if (lowIssues.length > 0) {
    console.log('💡 LOW PRIORITY ISSUES:');
    lowIssues.forEach(issue => {
      console.log(`   - ${issue.description}`);
      console.log(`     Fix: ${issue.fix}`);
    });
    console.log();
  }

  console.log('🔗 Next Steps:');
  console.log('1. Fix critical issues first');
  console.log('2. Test staff login at: http://localhost:3000/login');
  console.log('3. Monitor database health at: http://localhost:3000/api/health/database');
  console.log('4. Check application logs for any remaining errors\n');
}

async function main() {
  console.log('🚀 RYD Staff Login Fix Tool\n');

  try {
    // Diagnose issues
    const issues = await diagnoseStaffLogin();
    
    // Attempt automatic fixes
    await fixStaffLoginIssues(issues);
    
    // Re-diagnose to check if issues were fixed
    console.log('\n🔍 Re-checking after fixes...\n');
    const remainingIssues = await diagnoseStaffLogin();
    
    // Generate final report
    await generateReport(remainingIssues);
    
    // Test database health
    console.log('🏥 Testing database health...');
    const healthCheck = await databaseHealthMonitor.performHealthCheck();
    
    if (healthCheck.isHealthy) {
      console.log(`✅ Database health: OK (${healthCheck.responseTime}ms)`);
    } else {
      console.log(`❌ Database health: FAILED - ${healthCheck.error}`);
    }

    console.log('\n✨ Staff login fix process completed!');
    
  } catch (error) {
    console.error('❌ Fix process failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix script
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script error:', error);
      process.exit(1);
    });
}

export { diagnoseStaffLogin, fixStaffLoginIssues };