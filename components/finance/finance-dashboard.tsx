'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StipendsDashboard } from './stipends-dashboard'
import { ExpenseSubmission } from './expense-submission'
import { ExpenseApproval } from './expense-approval'
import { BudgetTracking } from './budget-tracking'
import { FinancialReports } from './financial-reports'
import { DollarSign, Users, Clock, CheckCircle, TrendingUp, AlertTriangle, FileText, BarChart3 } from 'lucide-react'

interface FinanceStats {
  totalStipends: number
  totalExpenses: number
  pendingApprovals: number
  monthlyBudget: number
  remainingBudget: number
  overBudgetDepartments: number
}

export function FinanceDashboard() {
  const [stats, setStats] = useState<FinanceStats>({
    totalStipends: 0,
    totalExpenses: 0,
    pendingApprovals: 0,
    monthlyBudget: 0,
    remainingBudget: 0,
    overBudgetDepartments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // This would fetch from a dedicated stats API endpoint
      // For now, we'll use mock data
      setStats({
        totalStipends: 2500000,
        totalExpenses: 1800000,
        pendingApprovals: 12,
        monthlyBudget: 5000000,
        remainingBudget: 700000,
        overBudgetDepartments: 2
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const budgetUtilization = stats.monthlyBudget > 0 
    ? ((stats.monthlyBudget - stats.remainingBudget) / stats.monthlyBudget) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance & Resource Tracking</h1>
        <p className="text-muted-foreground">
          Comprehensive financial management system for stipends, expenses, budgets, and reporting
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stipends</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalStipends.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              UGX {stats.remainingBudget.toLocaleString()} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {stats.overBudgetDepartments > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Budget Alert</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              {stats.overBudgetDepartments} department{stats.overBudgetDepartments > 1 ? 's have' : ' has'} exceeded their budget allocation
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="stipends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stipends">Stipends</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="stipends" className="mt-6">
          <StipendsDashboard />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Expense Management</h2>
                <p className="text-muted-foreground">
                  Submit and track expense requests
                </p>
              </div>
              <ExpenseSubmission onSuccess={() => {
                // Refresh data
                fetchStats()
              }} />
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Expense Requests</CardTitle>
                <CardDescription>
                  Your recent expense submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Recent expense requests will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <ExpenseApproval />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <BudgetTracking />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
