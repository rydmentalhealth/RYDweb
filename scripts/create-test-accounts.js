// Simple script to create test accounts in Firebase
// Run this in the browser console on the Firebase login page

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

console.log('Test accounts to create:');
testAccounts.forEach(account => {
  console.log(`Email: ${account.email}`);
  console.log(`Password: ${account.password}`);
  console.log(`Role: ${account.role}`);
  console.log(`Status: ${account.status}`);
  console.log('---');
});

console.log('\nTo create these accounts:');
console.log('1. Go to http://localhost:3001/firebase-login');
console.log('2. Open browser console');
console.log('3. Run the createTestAccounts() function');
console.log('4. Or manually create accounts in Firebase Console');

// Function to create test accounts (run in browser console)
window.createTestAccounts = async function() {
  const { createUserWithEmail } = await import('/lib/firebase-auth.js');
  
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
    } catch (error) {
      if (error.message.includes('email-already-in-use')) {
        console.log(`⚠️  Account already exists: ${account.email}`);
      } else {
        console.error(`❌ Error creating account ${account.email}:`, error.message);
      }
    }
  }
  
  console.log('🎉 Test accounts setup complete!');
};