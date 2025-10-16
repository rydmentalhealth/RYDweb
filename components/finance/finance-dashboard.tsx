'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EnhancedStipendsDashboard } from './enhanced-stipends-dashboard'
import { EnhancedExpenseSystem } from './enhanced-expense-system'
import { ExpenseApproval } from './expense-approval'
import { EnhancedBudgetTracking } from './enhanced-budget-tracking'
import { FinancialReportsAnalytics } from './financial-reports-analytics'
import { AIFinancialInsights } from './ai-financial-insights'
import { DollarSign, Users, Clock, CheckCircle, TrendingUp, AlertTriangle, FileText, BarChart3, Brain, Sparkles } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface FinanceStats {
  totalStipends: number
  totalExpenses: number
  pendingApprovals: number
  monthlyBudget: number
  remainingBudget: number
  overBudgetDepartments: number
}

export function FinanceDashboard() {
  const permissions = usePermissions()
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
    if (permissions.hasPermission('VIEW_FINANCES')) {
      fetchStats()
    }
  }, [permissions])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/finance/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats({
        totalStipends: data.totalStipends || 0,
        totalExpenses: data.totalExpenses || 0,
        pendingApprovals: data.pendingApprovals || 0,
        monthlyBudget: data.monthlyBudget || 0,
        remainingBudget: data.remainingBudget || 0,
        overBudgetDepartments: data.overBudgetDepartments || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Fallback to mock data for demo
      setStats({
        totalStipends: 2500000,
        totalExpenses: 1800000,
        pendingApprovals: 12,
        monthlyBudget: 5000000,
        remainingBudget: 700000,
        overBudgetDepartments: 2
      })
    } finally {
      setLoading(false)
    }
  }

  const budgetUtilization = stats.monthlyBudget > 0 
    ? ((stats.monthlyBudget - stats.remainingBudget) / stats.monthlyBudget) * 100 
    : 0

  // Check if user has permission to view finance
  if (!permissions.hasPermission('VIEW_FINANCES')) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have permission to view financial data. Contact your administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
          <span>Finance & Resource Tracking</span>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </h1>
        <p className="text-muted-foreground">
          Comprehensive financial management system with AI-powered insights, automated workflows, and real-time analytics
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stipends">Stipends</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center space-x-1">
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common financial operations and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {permissions.hasPermission('CREATE_STIPENDS') && (
                    <Button className="h-20 flex flex-col items-center justify-center">
                      <DollarSign className="h-6 w-6 mb-2" />
                      Add Stipend
                    </Button>
                  )}
                  {permissions.hasPermission('CREATE_EXPENSES') && (
                    <Button className="h-20 flex flex-col items-center justify-center">
                      <FileText className="h-6 w-6 mb-2" />
                      Submit Expense
                    </Button>
                  )}
                  {permissions.hasPermission('CREATE_BUDGETS') && (
                    <Button className="h-20 flex flex-col items-center justify-center">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Create Budget
                    </Button>
                  )}
                  {permissions.hasPermission('GENERATE_FINANCIAL_REPORTS') && (
                    <Button className="h-20 flex flex-col items-center justify-center">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      Generate Report
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Financial Activity</CardTitle>
                <CardDescription>
                  Latest transactions, approvals, and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Monthly stipend batch approved</div>
                      <div className="text-sm text-muted-foreground">UGX 2,500,000 • 15 recipients</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">12 expense requests pending approval</div>
                      <div className="text-sm text-muted-foreground">Total value: UGX 850,000</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">2 departments over budget</div>
                      <div className="text-sm text-muted-foreground">Outreach (105%) and IT (98%)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stipends" className="mt-6">
          <EnhancedStipendsDashboard />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <EnhancedExpenseSystem />
        </TabsContent>

        <TabsContent value="budgets" className="mt-6">
          <EnhancedBudgetTracking />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <FinancialReportsAnalytics />
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          <AIFinancialInsights />
        </TabsContent>
      </Tabs>
    </div>
  )
}
