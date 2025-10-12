const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck",
  authDomain: "rydadmin-hub.firebaseapp.com",
  projectId: "rydadmin-hub",
  storageBucket: "rydadmin-hub.firebasestorage.app",
  messagingSenderId: "20289389765",
  appId: "1:20289389765:web:89e94da7bf396fc946dcac",
  measurementId: "G-B69WZL3B7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createTestAccounts() {
  const testAccounts = [
    {
      email: 'superadmin@rydadmin.com',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    },
    {
      email: 'admin@rydadmin.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE'
    },
    {
      email: 'manager@rydadmin.com',
      password: 'Manager123!',
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
      status: 'ACTIVE'
    },
    {
      email: 'staff@rydadmin.com',
      password: 'Staff123!',
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF',
      status: 'ACTIVE'
    },
    {
      email: 'pending@rydadmin.com',
      password: 'Pending123!',
      firstName: 'Pending',
      lastName: 'User',
      role: 'USER',
      status: 'PENDING'
    }
  ];

  const results = [];

  for (const account of testAccounts) {
    try {
      console.log(`Creating account: ${account.email}...`);
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, account.email, account.password);
      const firebaseUser = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email: firebaseUser.email,
        firstName: account.firstName,
        lastName: account.lastName,
        name: `${account.firstName} ${account.lastName}`.trim(),
        role: account.role,
        status: account.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      results.push({
        email: account.email,
        status: 'created',
        message: 'User created successfully',
        role: account.role,
        password: account.password
      });

      console.log(`✅ Created: ${account.email} (${account.role})`);
    } catch (error) {
      console.error(`❌ Error creating ${account.email}:`, error.message);
      results.push({
        email: account.email,
        status: 'error',
        message: error.message
      });
    }
  }

  return results;
}

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