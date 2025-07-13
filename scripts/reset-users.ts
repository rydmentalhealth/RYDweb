import { PrismaClient, UserRole, UserStatus } from '../lib/generated/prisma';
import { hashPassword } from '../lib/server/bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

async function resetUsers() {
  try {
    console.log('Starting database reset...');

    // Delete all existing records in reverse order of dependencies
    console.log('Deleting existing users and related records...');
    
    // First delete task assignees (which reference users)
    await prisma.taskAssignee.deleteMany({});
    console.log('Deleted all task assignees');
    
    // Delete attendance check-ins
    await prisma.checkIn.deleteMany({});
    console.log('Deleted all attendance check-ins');
    
    // Delete project members
    await prisma.projectMember.deleteMany({});
    console.log('Deleted all project members');
    
    // Delete task comments
    await prisma.taskComment.deleteMany({});
    console.log('Deleted all task comments');
    
    // Delete time entries
    await prisma.timeEntry.deleteMany({});
    console.log('Deleted all time entries');
    
    // Delete sessions
    await prisma.session.deleteMany({});
    console.log('Deleted all sessions');
    
    // Delete accounts
    await prisma.account.deleteMany({});
    console.log('Deleted all accounts');
    
    // Finally delete users
    await prisma.user.deleteMany({});
    console.log('Deleted all users');

    // Create new admin user with unified model
    const adminPassword = await hashPassword('Admin@123');
    
    // Create admin user with all fields in the unified User model
    const user = await prisma.user.create({
      data: {
        firstName: 'Augustus',
        lastName: 'Twinemugabe',
        name: 'Augustus Twinemugabe',
        email: 'info@rydmentalhealth.org',
        password: adminPassword,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        approvedAt: new Date(),
        jobTitle: 'Executive Director',
        department: 'Administration',
        weeklyHours: 40,
      },
    });
    
    console.log(`Created admin user with email: ${user.email}`);
    console.log(`User details: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log('Database reset completed successfully');

  } catch (error) {
    console.error('Error during database reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset function
resetUsers(); 