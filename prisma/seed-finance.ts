import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding finance data...')

  // Create sample users if they don't exist
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rydmentalhealth.org' },
    update: {},
    create: {
      email: 'admin@rydmentalhealth.org',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      department: 'Admin',
      jobTitle: 'System Administrator',
    },
  })

  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@rydmentalhealth.org' },
    update: {},
    create: {
      email: 'finance@rydmentalhealth.org',
      name: 'Finance Manager',
      firstName: 'Finance',
      lastName: 'Manager',
      role: 'ADMIN',
      status: 'ACTIVE',
      department: 'Finance',
      jobTitle: 'Finance Manager',
    },
  })

  const outreachUser = await prisma.user.upsert({
    where: { email: 'outreach@rydmentalhealth.org' },
    update: {},
    create: {
      email: 'outreach@rydmentalhealth.org',
      name: 'Outreach Coordinator',
      firstName: 'Outreach',
      lastName: 'Coordinator',
      role: 'STAFF',
      status: 'ACTIVE',
      department: 'Outreach',
      jobTitle: 'Outreach Coordinator',
    },
  })

  const therapyUser = await prisma.user.upsert({
    where: { email: 'therapy@rydmentalhealth.org' },
    update: {},
    create: {
      email: 'therapy@rydmentalhealth.org',
      name: 'Therapy Lead',
      firstName: 'Therapy',
      lastName: 'Lead',
      role: 'STAFF',
      status: 'ACTIVE',
      department: 'Therapy',
      jobTitle: 'Therapy Lead',
    },
  })

  // Create sample departmental budgets
  const currentPeriod = '2025-01'
  
  const outreachBudget = await prisma.departmentBudget.upsert({
    where: { 
      department_budgetPeriod: {
        department: 'Outreach',
        budgetPeriod: currentPeriod
      }
    },
    update: {},
    create: {
      department: 'Outreach',
      budgetPeriod: currentPeriod,
      allocatedAmount: 1500000,
      spentAmount: 1200000,
      remainingAmount: 300000,
      isActive: true,
      createdById: adminUser.id,
    },
  })

  const therapyBudget = await prisma.departmentBudget.upsert({
    where: { 
      department_budgetPeriod: {
        department: 'Therapy',
        budgetPeriod: currentPeriod
      }
    },
    update: {},
    create: {
      department: 'Therapy',
      budgetPeriod: currentPeriod,
      allocatedAmount: 1000000,
      spentAmount: 800000,
      remainingAmount: 200000,
      isActive: true,
      createdById: adminUser.id,
    },
  })

  const itBudget = await prisma.departmentBudget.upsert({
    where: { 
      department_budgetPeriod: {
        department: 'IT',
        budgetPeriod: currentPeriod
      }
    },
    update: {},
    create: {
      department: 'IT',
      budgetPeriod: currentPeriod,
      allocatedAmount: 800000,
      spentAmount: 600000,
      remainingAmount: 200000,
      isActive: true,
      createdById: adminUser.id,
    },
  })

  const mediaBudget = await prisma.departmentBudget.upsert({
    where: { 
      department_budgetPeriod: {
        department: 'Media',
        budgetPeriod: currentPeriod
      }
    },
    update: {},
    create: {
      department: 'Media',
      budgetPeriod: currentPeriod,
      allocatedAmount: 700000,
      spentAmount: 500000,
      remainingAmount: 200000,
      isActive: true,
      createdById: adminUser.id,
    },
  })

  // Create sample stipends
  const stipends = [
    {
      employeeId: outreachUser.id,
      amount: 500000,
      type: 'MONTHLY_STIPEND',
      status: 'PAID',
      paymentDate: new Date('2025-01-15'),
      paymentMethod: 'MOBILE_MONEY',
      department: 'Outreach',
      remarks: 'January 2025 stipend',
      approvedById: financeUser.id,
    },
    {
      employeeId: therapyUser.id,
      amount: 450000,
      type: 'MONTHLY_STIPEND',
      status: 'PAID',
      paymentDate: new Date('2025-01-15'),
      paymentMethod: 'BANK_TRANSFER',
      department: 'Therapy',
      remarks: 'January 2025 stipend',
      approvedById: financeUser.id,
    },
    {
      employeeId: outreachUser.id,
      amount: 100000,
      type: 'TRANSPORT_ALLOWANCE',
      status: 'PENDING',
      department: 'Outreach',
      remarks: 'Transport allowance for field visits',
      approvedById: financeUser.id,
    },
  ]

  for (const stipendData of stipends) {
    await prisma.stipend.create({
      data: stipendData,
    })
  }

  // Create sample expense requests
  const expenses = [
    {
      requesterId: outreachUser.id,
      purpose: 'Client Outreach Event',
      category: 'OUTREACH_EVENT',
      amount: 250000,
      description: 'Community outreach event in Kampala',
      department: 'Outreach',
      status: 'PAID',
      teamLeadId: outreachUser.id,
      teamLeadApprovedAt: new Date('2025-01-10'),
      financeApprovedById: financeUser.id,
      financeApprovedAt: new Date('2025-01-12'),
      paidAt: new Date('2025-01-15'),
      paymentMethod: 'BANK_TRANSFER',
    },
    {
      requesterId: therapyUser.id,
      purpose: 'Training Workshop',
      category: 'TRAINING',
      amount: 150000,
      description: 'Mental health training workshop',
      department: 'Therapy',
      status: 'APPROVED_BY_FINANCE',
      teamLeadId: therapyUser.id,
      teamLeadApprovedAt: new Date('2025-01-14'),
      financeApprovedById: financeUser.id,
      financeApprovedAt: new Date('2025-01-16'),
    },
    {
      requesterId: outreachUser.id,
      purpose: 'Transportation Costs',
      category: 'TRANSPORT',
      amount: 75000,
      description: 'Field visit transportation',
      department: 'Outreach',
      status: 'PENDING',
    },
  ]

  for (const expenseData of expenses) {
    await prisma.expenseRequest.create({
      data: expenseData,
    })
  }

  // Create sample financial reports
  const reports = [
    {
      reportType: 'MONTHLY_SUMMARY',
      period: currentPeriod,
      title: 'January 2025 Financial Summary',
      description: 'Monthly financial overview for January 2025',
      generatedById: financeUser.id,
      data: {
        totalStipends: 1000000,
        totalExpenses: 475000,
        totalBudget: 4000000,
        remainingBudget: 2525000,
      },
    },
    {
      reportType: 'DEPARTMENTAL_REPORT',
      period: currentPeriod,
      title: 'Departmental Budget Report - January 2025',
      description: 'Department-wise budget utilization report',
      generatedById: financeUser.id,
      data: {
        departments: ['Outreach', 'Therapy', 'IT', 'Media'],
        totalAllocated: 4000000,
        totalSpent: 1475000,
      },
    },
  ]

  for (const reportData of reports) {
    await prisma.financialReport.create({
      data: reportData,
    })
  }

  console.log('✅ Finance data seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding finance data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
