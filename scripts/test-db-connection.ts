#!/usr/bin/env ts-node

/**
 * Database Connection Test Script
 * Tests the RYD Staff System database connection and basic operations
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  console.log('🔍 Testing RYD Staff System Database Connection...\n')

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic database connection...')
    await prisma.$connect()
    console.log('   ✅ Database connection successful\n')

    // Test 2: Count users
    console.log('2. Testing user system...')
    const userCount = await prisma.user.count()
    const activeUsers = await prisma.user.count({ where: { status: 'ACTIVE' } })
    console.log(`   ✅ Total users: ${userCount}`)
    console.log(`   ✅ Active users: ${activeUsers}\n`)

    // Test 3: Count employees
    console.log('3. Testing employee system...')
    const employeeCount = await prisma.employeeProfile.count()
    console.log(`   ✅ Employee profiles: ${employeeCount}\n`)

    // Test 4: Count teams
    console.log('4. Testing team system...')
    const teamCount = await prisma.team.count()
    const activeTeams = await prisma.team.count({ where: { isActive: true } })
    console.log(`   ✅ Total teams: ${teamCount}`)
    console.log(`   ✅ Active teams: ${activeTeams}\n`)

    // Test 5: Count projects
    console.log('5. Testing project system...')
    const projectCount = await prisma.project.count()
    const activeProjects = await prisma.project.count({ where: { status: 'ACTIVE' } })
    console.log(`   ✅ Total projects: ${projectCount}`)
    console.log(`   ✅ Active projects: ${activeProjects}\n`)

    // Test 6: Count tasks
    console.log('6. Testing task system...')
    const taskCount = await prisma.task.count()
    const completedTasks = await prisma.task.count({ where: { status: 'COMPLETED' } })
    console.log(`   ✅ Total tasks: ${taskCount}`)
    console.log(`   ✅ Completed tasks: ${completedTasks}\n`)

    // Test 7: Count financial transactions
    console.log('7. Testing finance system...')
    const transactionCount = await prisma.financialTransaction.count()
    const expenseCount = await prisma.expenseRequest.count()
    console.log(`   ✅ Financial transactions: ${transactionCount}`)
    console.log(`   ✅ Expense requests: ${expenseCount}\n`)

    // Test 8: Count communication data
    console.log('8. Testing communication system...')
    const channelCount = await prisma.chatChannel.count()
    const messageCount = await prisma.chatMessage.count()
    const announcementCount = await prisma.announcement.count()
    console.log(`   ✅ Chat channels: ${channelCount}`)
    console.log(`   ✅ Chat messages: ${messageCount}`)
    console.log(`   ✅ Announcements: ${announcementCount}\n`)

    // Test 9: Sample user data
    console.log('9. Testing user data retrieval...')
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('   ✅ Sample users:')
    sampleUsers.forEach(user => {
      console.log(`      - ${user.name || user.email} (${user.role}) - ${user.status}`)
    })
    console.log()

    // Test 10: Database health check
    console.log('10. Performing database health check...')
    const healthQuery = await prisma.$queryRaw`SELECT version() as version, current_database() as database, current_user as user`
    console.log('    ✅ Database health check passed')
    console.log(`    📊 Database info: ${JSON.stringify(healthQuery, null, 2)}\n`)

    console.log('🎉 All database tests passed successfully!')
    console.log('🔗 RYD Staff System is properly connected to the database.')
    
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Test script error:', error)
    process.exit(1)
  })

export { testDatabaseConnection }