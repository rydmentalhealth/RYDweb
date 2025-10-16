import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugUsers() {
  try {
    console.log('=== User Debug Information ===')
    
    // Count all users
    const totalUsers = await prisma.user.count()
    console.log(`Total users in database: ${totalUsers}`)
    
    // Count by status
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      _count: { id: true }
    })
    console.log('Users by status:', usersByStatus)
    
    // Count by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })
    console.log('Users by role:', usersByRole)
    
    // Count active users
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    })
    console.log(`Active users: ${activeUsers}`)
    
    // Count employee profiles
    const employeeProfiles = await prisma.employeeProfile.count()
    console.log(`Employee profiles: ${employeeProfiles}`)
    
    // Count active users without employee profiles
    const availableForEmployee = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        employeeProfile: null
      }
    })
    console.log(`Active users available for employee creation: ${availableForEmployee}`)
    
    // Show some sample users
    const sampleUsers = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        employeeProfile: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true
      },
      take: 5
    })
    
    console.log('\nSample available users:')
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.name || `${user.firstName} ${user.lastName}`} (${user.role})`)
    })
    
    if (availableForEmployee === 0) {
      console.log('\n⚠️  No users available for employee creation!')
      console.log('This could be because:')
      console.log('1. All active users already have employee profiles')
      console.log('2. No users have ACTIVE status')
      console.log('3. Database is empty')
      
      // Check if we need to create test users
      if (totalUsers === 0) {
        console.log('\n💡 Consider running the seed script to create test data')
      }
    }
    
  } catch (error) {
    console.error('Error debugging users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugUsers()