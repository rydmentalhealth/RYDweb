import { PrismaClient, UserRole, UserStatus } from '../lib/generated/prisma';
import { hashPassword } from '../lib/server/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Admin users to create
  const adminUsers = [
    {
      email: 'augustus.twinemugabe@rydmentalhealth.org',
      firstName: 'Augustus',
      lastName: 'Twinemugabe',
      name: 'Augustus Twinemugabe',
      password: 'geniusmind',
      jobTitle: 'System Administrator',
      department: 'IT',
    },
    {
      email: 'shalom.omondo@rydmentalhealth.org',
      firstName: 'Shalom',
      lastName: 'Omondo',
      name: 'Shalom Omondo',
      password: 'geniusmind',
      jobTitle: 'Administrator',
      department: 'Management',
    }
  ];

  // Staff users to create (these will be available for employee creation)
  const staffUsers = [
    {
      email: 'sarah.therapist@rydmentalhealth.org',
      firstName: 'Sarah',
      lastName: 'Johnson',
      name: 'Sarah Johnson',
      password: 'staffpass123',
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
      password: 'staffpass123',
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
      password: 'staffpass123',
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
      password: 'staffpass123',
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
      password: 'staffpass123',
      role: UserRole.STAFF,
      jobTitle: 'Research Assistant',
      department: 'Research',
      phone: '+256700567890'
    }
  ];

  // Create admin users
  for (const adminData of adminUsers) {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email },
    });
    
    if (!existingAdmin) {
      // Create admin user
      const adminPassword = await hashPassword(adminData.password);
    
      const admin = await prisma.user.create({
        data: {
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          name: adminData.name,
          email: adminData.email,
          password: adminPassword,
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          approvedAt: new Date(),
          jobTitle: adminData.jobTitle,
          department: adminData.department,
          weeklyHours: 40,
        },
      });
      
      console.log(`✅ Created admin user: ${admin.email} (${admin.name})`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${adminData.email}`);
    }
  }

  // Create staff users (these will be available for employee creation)
  for (const staffData of staffUsers) {
    // Check if staff user already exists
    const existingStaff = await prisma.user.findUnique({
      where: { email: staffData.email },
    });
    
    if (!existingStaff) {
      // Create staff user
      const staffPassword = await hashPassword(staffData.password);
    
      const staff = await prisma.user.create({
        data: {
          firstName: staffData.firstName,
          lastName: staffData.lastName,
          name: staffData.name,
          email: staffData.email,
          password: staffPassword,
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

  // Create predefined teams
  const teams = [
    {
      name: 'Therapy',
      description: 'Mental health therapy and counseling services',
      color: '#10b981', // green
      icon: 'Heart'
    },
    {
      name: 'Web and IT',
      description: 'Website development, IT support, and digital infrastructure',
      color: '#3b82f6', // blue
      icon: 'Code'
    },
    {
      name: 'Events and Community Outreach',
      description: 'Community events, outreach programs, and public engagement',
      color: '#f59e0b', // amber
      icon: 'Users'
    },
    {
      name: 'Marketing and PR',
      description: 'Marketing campaigns, public relations, and brand management',
      color: '#ef4444', // red
      icon: 'Megaphone'
    },
    {
      name: 'Writing and Content Creation',
      description: 'Content writing, blog posts, and written materials',
      color: '#8b5cf6', // purple
      icon: 'PenTool'
    },
    {
      name: 'Graphics and Media Production',
      description: 'Graphic design, video production, and multimedia content',
      color: '#06b6d4', // cyan
      icon: 'Palette'
    },
    {
      name: 'Grants and Research',
      description: 'Grant writing, research projects, and funding acquisition',
      color: '#84cc16', // lime
      icon: 'Search'
    }
  ];

  console.log('📋 Creating teams...');
  for (const teamData of teams) {
    const existingTeam = await prisma.team.findUnique({
      where: { name: teamData.name }
    });

    if (!existingTeam) {
      await prisma.team.create({
        data: teamData
      });
      console.log(`✅ Created team: ${teamData.name}`);
    } else {
      console.log(`⚡ Team already exists: ${teamData.name}`);
    }
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 