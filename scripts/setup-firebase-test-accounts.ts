import { createUserWithEmail } from '../lib/firebase-auth';

async function setupTestAccounts() {
  console.log('Setting up Firebase test accounts...');
  
  const testAccounts = [
    {
      email: 'admin@rydadmin.com',
      password: 'admin123',
      displayName: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    {
      email: 'staff@rydadmin.com',
      password: 'staff123',
      displayName: 'Staff User',
      role: 'STAFF',
      status: 'ACTIVE'
    },
    {
      email: 'volunteer@rydadmin.com',
      password: 'volunteer123',
      displayName: 'Volunteer User',
      role: 'VOLUNTEER',
      status: 'ACTIVE'
    },
    {
      email: 'pending@rydadmin.com',
      password: 'pending123',
      displayName: 'Pending User',
      role: 'VOLUNTEER',
      status: 'PENDING'
    }
  ];

  for (const account of testAccounts) {
    try {
      console.log(`Creating account: ${account.email}`);
      const result = await createUserWithEmail(
        account.email,
        account.password,
        account.displayName,
        account.role,
        account.status
      );
      console.log(`✅ Created account: ${account.email} (${account.role})`);
    } catch (error: any) {
      if (error.message.includes('email-already-in-use')) {
        console.log(`⚠️  Account already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating account ${account.email}:`, error.message);
      }
    }
  }

  console.log('\n🎉 Test accounts setup complete!');
  console.log('\nTest Account Details:');
  console.log('===================');
  testAccounts.forEach(account => {
    console.log(`Email: ${account.email}`);
    console.log(`Password: ${account.password}`);
    console.log(`Role: ${account.role}`);
    console.log(`Status: ${account.status}`);
    console.log('---');
  });
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupTestAccounts().catch(console.error);
}

export { setupTestAccounts };