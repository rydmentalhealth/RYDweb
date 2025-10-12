import { NextRequest, NextResponse } from 'next/server';
import { createTestAccounts } from '@/lib/firebase-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test accounts...');
    
    const results = await createTestAccounts();
    
    return NextResponse.json({
      success: true,
      message: 'Test accounts creation completed',
      results
    });
  } catch (error) {
    console.error('Error creating test accounts:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create test accounts',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to create test accounts',
    testAccounts: [
      {
        email: 'superadmin@rydadmin.com',
        password: 'SuperAdmin123!',
        role: 'SUPER_ADMIN',
        description: 'Full system access including system settings'
      },
      {
        email: 'admin@rydadmin.com',
        password: 'Admin123!',
        role: 'ADMIN',
        description: 'Administrative access to users and dashboards'
      },
      {
        email: 'manager@rydadmin.com',
        password: 'Manager123!',
        role: 'MANAGER',
        description: 'Staff management capabilities'
      },
      {
        email: 'staff@rydadmin.com',
        password: 'Staff123!',
        role: 'STAFF',
        description: 'Basic staff access'
      },
      {
        email: 'pending@rydadmin.com',
        password: 'Pending123!',
        role: 'USER',
        description: 'Pending approval user'
      }
    ]
  });
}