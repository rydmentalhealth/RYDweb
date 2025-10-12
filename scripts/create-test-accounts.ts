import { createTestAccounts } from '../lib/firebase-auth.js';

async function main() {
  console.log('🚀 Creating test accounts for RYD Admin Hub...');
  
  try {
    const results = await createTestAccounts();
    
    console.log('\n📋 Test Account Creation Results:');
    console.log('================================');
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.email}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Message: ${result.message}`);
      if (result.role) {
        console.log(`   Role: ${result.role}`);
      }
      if (result.password) {
        console.log(`   Password: ${result.password}`);
      }
    });
    
    console.log('\n✅ Test account creation completed!');
    console.log('\n🔐 Test Account Credentials:');
    console.log('============================');
    console.log('Super Admin: superadmin@rydadmin.com / SuperAdmin123!');
    console.log('Admin: admin@rydadmin.com / Admin123!');
    console.log('Manager: manager@rydadmin.com / Manager123!');
    console.log('Staff: staff@rydadmin.com / Staff123!');
    console.log('Pending: pending@rydadmin.com / Pending123!');
    
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    process.exit(1);
  }
}

main();