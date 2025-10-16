import { PrismaClient, UserRole, UserStatus } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🌱 Creating test users for employee system...');

  // Staff users to create (these will be available for employee creation)
  const staffUsers = [
    {
      email: 'sarah.therapist@rydmentalhealth.org',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      role: UserRole.STAFF,
      jobTitle: 'Mental Health Therapist',
      department: 'Therapy',
      phone: '+256700123456'
    },
    {
      email: 'michael.coordinator@rydmentalhealth.org',
      firstName: 'Michael',
      lastName: 'Ochieng',
      name: 'Michael Ochieng',
      role: UserRole.STAFF,
      jobTitle: 'Outreach Coordinator',
      department: 'Outreach',
      phone: '+256700234567'
    },
    {
      email: 'grace.counselor@rydmentalhealth.org',
      firstName: 'Grace',
      lastName: 'Nakato',
      name: 'Grace Nakato',
      role: UserRole.STAFF,
      jobTitle: 'Youth Counselor',
      department: 'Therapy',
      phone: '+256700345678'
    },
    {
      email: 'david.finance@rydmentalhealth.org',
      firstName: 'David',
      lastName: 'Mukasa',
      name: 'David Mukasa',
      role: UserRole.STAFF,
      jobTitle: 'Finance Officer',
      department: 'Finance',
      phone: '+256700456789'
    },
    {
      email: 'mary.researcher@rydmentalhealth.org',
      firstName: 'Mary',
      lastName: 'Nambi',
      name: 'Mary Nambi',
      role: UserRole.STAFF,
      jobTitle: 'Research Assistant',
      department: 'Research',
      phone: '+256700567890'
    }
  ];

  try {
    // Create staff users (these will be available for employee creation)
    for (const staffData of staffUsers) {
      // Check if staff user already exists
      const existingStaff = await prisma.user.findUnique({
        where: { email: staffData.email },
      });
      
      if (!existingStaff) {
        // Create staff user without password (they can set it later)
        const staff = await prisma.user.create({
          data: {
            firstName: staffData.firstName,
            lastName: staffData.lastName,
            name: staffData.name,
            email: staffData.email,
            role: staffData.role,
            status: UserStatus.ACTIVE,
            jobTitle: staffData.jobTitle,
            department: staffData.department,
            phone: staffData.phone,
            weeklyHours: 40,
          },
        });
        
        console.log(`✅ Created staff user: ${staff.email} (${staff.name}) - Available for employee creation`);
      } else {
        console.log(`ℹ️  Staff user already exists: ${staffData.email}`);
      }
    }

    // Check current state
    const availableForEmployee = await prisma.user.count({
      where: {
        status: 'ACTIVE',
        employeeProfile: null
      }
    });

    console.log(`\n📊 Summary:`);
    console.log(`- Active users available for employee creation: ${availableForEmployee}`);
    
    if (availableForEmployee > 0) {
      console.log(`✅ Success! HR can now add employees from these ${availableForEmployee} active users.`);
    } else {
      console.log(`⚠️  No users available for employee creation. All active users already have employee profiles.`);
    }

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();