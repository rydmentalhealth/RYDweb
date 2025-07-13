"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, GiftIcon, ReceiptIcon, TrendingDownIcon, TrendingUpIcon, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface FinanceStatsProps {
  className?: string
}

interface FinanceStats {
  totalIncome: number
  totalExpenses: number
  totalDonations: number
  totalGrants: number
  incomeChange: number
  expenseChange: number
  donationChange: number
  grantChange: number
}

export function FinanceStats({ className }: FinanceStatsProps) {
  const [stats, setStats] = useState<FinanceStats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalDonations: 0,
    totalGrants: 0,
    incomeChange: 0,
    expenseChange: 0,
    donationChange: 0,
    grantChange: 0
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/finance/stats')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.status}`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching finance stats:', error)
        toast.error('Failed to load financial statistics')
        // Fall back to dummy data in case of error
        setStats({
          totalIncome: 12500.00,
          totalExpenses: 7800.00,
          totalDonations: 6200.00,
          totalGrants: 5000.00,
          incomeChange: 12.5,
          expenseChange: 5.2,
          donationChange: 8.7,
          grantChange: -3.1
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])
  
  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex justify-center items-center min-h-28">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Card>
        ))}
      </>
    )
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Income
          </CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalIncome)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.incomeChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {stats.incomeChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.incomeChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Expenses
          </CardTitle>
          <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.expenseChange > 0 ? (
              <span className="text-red-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {stats.expenseChange}% from last month
              </span>
            ) : (
              <span className="text-green-600 flex items-center">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.expenseChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Donations
          </CardTitle>
          <GiftIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalDonations)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.donationChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {stats.donationChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.donationChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Grants
          </CardTitle>
          <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalGrants)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.grantChange > 0 ? (
              <span className="text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                {stats.grantChange}% from last month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                {Math.abs(stats.grantChange)}% from last month
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </>
  )
} 