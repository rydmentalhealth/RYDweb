import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PrismaClient } from "@/lib/generated/prisma"

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      })
    }
    
    // Get current date
    const now = new Date()
    
    // Calculate date ranges
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Use direct PrismaClient instance
    const prisma = new PrismaClient()
    
    // Get current month transactions
    const currentMonthTransactions = await prisma.financialTransaction.findMany({
      where: {
        date: {
          gte: currentMonthStart,
          lte: now,
        },
      },
    })
    
    // Get previous month transactions
    const previousMonthTransactions = await prisma.financialTransaction.findMany({
      where: {
        date: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    })
    
    // Calculate totals for current month
    const currentIncome = sumTransactionsByType(currentMonthTransactions, "INCOME")
    const currentExpenses = sumTransactionsByType(currentMonthTransactions, "EXPENSE")
    const currentDonations = sumTransactionsByType(currentMonthTransactions, "DONATION")
    const currentGrants = sumTransactionsByType(currentMonthTransactions, "GRANT")
    
    // Calculate totals for previous month
    const previousIncome = sumTransactionsByType(previousMonthTransactions, "INCOME")
    const previousExpenses = sumTransactionsByType(previousMonthTransactions, "EXPENSE")
    const previousDonations = sumTransactionsByType(previousMonthTransactions, "DONATION")
    const previousGrants = sumTransactionsByType(previousMonthTransactions, "GRANT")
    
    // Calculate percentage changes
    const incomeChange = calculatePercentageChange(previousIncome, currentIncome)
    const expenseChange = calculatePercentageChange(previousExpenses, currentExpenses)
    const donationChange = calculatePercentageChange(previousDonations, currentDonations)
    const grantChange = calculatePercentageChange(previousGrants, currentGrants)
    
    const stats = {
      totalIncome: currentIncome,
      totalExpenses: currentExpenses,
      totalDonations: currentDonations,
      totalGrants: currentGrants,
      incomeChange,
      expenseChange,
      donationChange,
      grantChange,
    }
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching finance stats:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch finance statistics" }), {
      status: 500,
    })
  }
}

// Helper function to sum transactions by type
function sumTransactionsByType(transactions: any[], type: string): number {
  return transactions
    .filter(transaction => transaction.type === type)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
}

// Helper function to calculate percentage change
function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  
  return parseFloat(((current - previous) / previous * 100).toFixed(1))
} 