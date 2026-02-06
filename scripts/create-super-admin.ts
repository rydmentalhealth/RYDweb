import { PrismaClient, UserRole, UserStatus } from '../lib/generated/prisma';
import { hashPassword } from '../lib/server/bcrypt';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  console.log('🔐 Creating super admin account...');

  const superAdminData = {
    email: 'rydmentalhealth@gmail.com',
    firstName: 'Super',
    lastName: 'Admin',
    name: 'Super Admin',
    password: '@st.ThomasNative#',
    jobTitle: 'Super Administrator',
    department: 'System Administration',
  };

  try {
    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: superAdminData.email },
    });
    
    if (existingAdmin) {
      console.log(`ℹ️  Super admin already exists: ${superAdminData.email}`);
      
      // Update the existing user to ensure they have super admin privileges
      const updatedAdmin = await prisma.user.update({
        where: { email: superAdminData.email },
        data: {
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          approvedAt: new Date(),
          jobTitle: superAdminData.jobTitle,
          department: superAdminData.department,
        },
      });
      
      console.log(`✅ Updated existing super admin: ${updatedAdmin.email} (${updatedAdmin.name})`);
      console.log(`   Role: ${updatedAdmin.role}, Status: ${updatedAdmin.status}`);
    } else {
      // Create new super admin user
      const adminPassword = await hashPassword(superAdminData.password);
    
      const admin = await prisma.user.create({
        data: {
          firstName: superAdminData.firstName,
          lastName: superAdminData.lastName,
          name: superAdminData.name,
          email: superAdminData.email,
          password: adminPassword,
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          approvedAt: new Date(),
          jobTitle: superAdminData.jobTitle,
          department: superAdminData.department,
          weeklyHours: 40,
        },
      });
      
      console.log(`✅ Created super admin user: ${admin.email} (${admin.name})`);
      console.log(`   Role: ${admin.role}, Status: ${admin.status}`);
    }

    console.log('🎉 Super admin account setup completed!');
    console.log('📧 Email: rydmentalhealth@gmail.com');
    console.log('🔑 Password: @st.ThomasNative#');
    console.log('👑 Role: SUPER_ADMIN');
    console.log('✅ Status: ACTIVE');
    
  } catch (error) {
    console.error('❌ Failed to create super admin:', error);
    throw error;
  }
}

createSuperAdmin()
  .catch((e) => {
    console.error('❌ Super admin creation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });