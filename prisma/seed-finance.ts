import { PrismaClient, TransactionType } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function seedFinanceData() {
  console.log('Seeding financial transactions...');
  
  // First check if we already have some transactions
  const existingTransactions = await prisma.financialTransaction.count();
  
  if (existingTransactions > 0) {
    console.log(`Found ${existingTransactions} existing transactions, skipping seeding`);
    return;
  }
  
  // Current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Sample transactions for current month
  const currentMonthTransactions = [
    // Income
    {
      amount: 10000,
      description: 'Monthly government grant',
      date: new Date(currentYear, currentMonth, 5),
      type: TransactionType.INCOME,
      category: 'Government Funding'
    },
    {
      amount: 5000,
      description: 'Corporate sponsorship - ABC Corp',
      date: new Date(currentYear, currentMonth, 12),
      type: TransactionType.INCOME,
      category: 'Corporate Sponsorship'
    },
    
    // Expenses
    {
      amount: 3500,
      description: 'Office rent',
      date: new Date(currentYear, currentMonth, 1),
      type: TransactionType.EXPENSE,
      category: 'Rent'
    },
    {
      amount: 1800,
      description: 'Staff salaries',
      date: new Date(currentYear, currentMonth, 15),
      type: TransactionType.EXPENSE,
      category: 'Salaries'
    },
    {
      amount: 750,
      description: 'Utilities',
      date: new Date(currentYear, currentMonth, 10),
      type: TransactionType.EXPENSE,
      category: 'Utilities'
    },
    
    // Donations
    {
      amount: 2500,
      description: 'Individual donor - John Smith',
      date: new Date(currentYear, currentMonth, 8),
      type: TransactionType.DONATION,
      category: 'Individual Donation'
    },
    {
      amount: 3500,
      description: 'Community fundraiser',
      date: new Date(currentYear, currentMonth, 20),
      type: TransactionType.DONATION,
      category: 'Fundraiser'
    },
    
    // Grants
    {
      amount: 15000,
      description: 'Mental Health Awareness Foundation Grant',
      date: new Date(currentYear, currentMonth, 18),
      type: TransactionType.GRANT,
      category: 'Foundation Grant'
    }
  ];
  
  // Sample transactions for previous month
  const previousMonthTransactions = [
    // Income
    {
      amount: 9000,
      description: 'Monthly government grant',
      date: new Date(prevMonthYear, prevMonth, 5),
      type: TransactionType.INCOME,
      category: 'Government Funding'
    },
    {
      amount: 4500,
      description: 'Corporate sponsorship - XYZ Inc',
      date: new Date(prevMonthYear, prevMonth, 14),
      type: TransactionType.INCOME,
      category: 'Corporate Sponsorship'
    },
    
    // Expenses
    {
      amount: 3500,
      description: 'Office rent',
      date: new Date(prevMonthYear, prevMonth, 1),
      type: TransactionType.EXPENSE,
      category: 'Rent'
    },
    {
      amount: 1700,
      description: 'Staff salaries',
      date: new Date(prevMonthYear, prevMonth, 15),
      type: TransactionType.EXPENSE,
      category: 'Salaries'
    },
    {
      amount: 800,
      description: 'Utilities',
      date: new Date(prevMonthYear, prevMonth, 10),
      type: TransactionType.EXPENSE,
      category: 'Utilities'
    },
    
    // Donations
    {
      amount: 2000,
      description: 'Individual donor - Jane Doe',
      date: new Date(prevMonthYear, prevMonth, 7),
      type: TransactionType.DONATION,
      category: 'Individual Donation'
    },
    {
      amount: 3000,
      description: 'Community fundraiser',
      date: new Date(prevMonthYear, prevMonth, 22),
      type: TransactionType.DONATION,
      category: 'Fundraiser'
    },
    
    // Grants
    {
      amount: 16000,
      description: 'Youth Development Grant',
      date: new Date(prevMonthYear, prevMonth, 16),
      type: TransactionType.GRANT,
      category: 'Foundation Grant'
    }
  ];
  
  // Create transactions in database
  const allTransactions = [...currentMonthTransactions, ...previousMonthTransactions];
  
  for (const transaction of allTransactions) {
    await prisma.financialTransaction.create({
      data: transaction
    });
  }
  
  console.log(`Created ${allTransactions.length} financial transactions`);
}

async function main() {
  try {
    await seedFinanceData();
  } catch (error) {
    console.error('Error seeding finance data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 