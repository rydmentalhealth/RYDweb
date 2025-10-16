'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Filter, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Edit, Trash2, Bell, Download, Upload, BarChart3, PieChart, LineChart } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { usePermissions } from '@/lib/hooks/usePermissions'

const budgetSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  budgetPeriod: z.string().min(1, 'Budget period is required'),
  allocatedAmount: z.number().positive('Amount must be positive'),
})

const adjustmentSchema = z.object({
  amount: z.number().min(1, 'Amount is required'),
  type: z.enum(['TOP_UP', 'REDUCTION', 'CORRECTION']),
  reason: z.string().min(1, 'Reason is required'),
})

interface DepartmentBudget {
  id: string
  department: string
  budgetPeriod: string
  allocatedAmount: number
  spentAmount: number
  remainingAmount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
  }
  lastModifiedBy?: {
    id: string
    name: string
  }
  adjustments: Array<{
    id: string
    amount: number
    type: string
    reason: string
    createdAt: string
    approvedBy: {
      id: string
      name: string
    }
  }>
  _count: {
    expenses: number
  }
  alerts?: Array<{
    type: 'WARNING' | 'CRITICAL' | 'INFO'
    message: string
    threshold: number
  }>
}

interface BudgetStats {
  totalAllocated: number
  totalSpent: number
  totalRemaining: number
  overBudgetDepartments: number
  nearLimitDepartments: number
  averageUtilization: number
  monthlyTrend: Array<{
    month: string
    allocated: number
    spent: number
  }>
  departmentComparison: Array<{
    department: string
    allocated: number
    spent: number
    utilization: number
  }>
}

export function EnhancedBudgetTracking() {
  const permissions = usePermissions()
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([])
  const [stats, setStats] = useState<BudgetStats>({
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overBudgetDepartments: 0,
    nearLimitDepartments: 0,
    averageUtilization: 0,
    monthlyTrend: [],
    departmentComparison: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<DepartmentBudget | null>(null)
  const [alertsVisible, setAlertsVisible] = useState(true)

  const budgetForm = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      department: '',
      budgetPeriod: '',
      allocatedAmount: 0,
    }
  })

  const adjustmentForm = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      amount: 0,
      type: 'TOP_UP',
      reason: '',
    }
  })

  useEffect(() => {
    if (permissions.hasPermission('VIEW_BUDGETS')) {
      fetchBudgets()
      fetchStats()
    }
  }, [permissions, departmentFilter, periodFilter, statusFilter])

  const fetchBudgets = async () => {
    try {
      const params = new URLSearchParams()
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      if (periodFilter !== 'all') params.append('period', periodFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/budgets?${params}`)
      if (!response.ok) throw new Error('Failed to fetch budgets')
      
      const data = await response.json()
      
      // Add alerts to budgets based on utilization
      const budgetsWithAlerts = data.budgets.map((budget: DepartmentBudget) => {
        const utilization = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0
        const alerts = []
        
        if (utilization >= 100) {
          alerts.push({
            type: 'CRITICAL' as const,
            message: 'Budget exceeded! Immediate attention required.',
            threshold: 100
          })
        } else if (utilization >= 90) {
          alerts.push({
            type: 'CRITICAL' as const,
            message: 'Budget critically low (90%+ used). Consider budget adjustment.',
            threshold: 90
          })
        } else if (utilization >= 80) {
          alerts.push({
            type: 'WARNING' as const,
            message: 'Budget warning (80%+ used). Monitor spending closely.',
            threshold: 80
          })
        } else if (utilization >= 60) {
          alerts.push({
            type: 'INFO' as const,
            message: 'Budget on track (60%+ used).',
            threshold: 60
          })
        }
        
        return { ...budget, alerts }
      })
      
      setBudgets(budgetsWithAlerts)
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/budgets/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const onBudgetSubmit = async (data: z.infer<typeof budgetSchema>) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create budget')
      }

      toast.success('Budget created successfully')
      budgetForm.reset()
      setIsAddDialogOpen(false)
      fetchBudgets()
      fetchStats()
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create budget')
    }
  }

  const onAdjustmentSubmit = async (data: z.infer<typeof adjustmentSchema>) => {
    if (!selectedBudget) return

    try {
      const response = await fetch(`/api/budgets/${selectedBudget.id}/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to adjust budget')
      }

      toast.success('Budget adjusted successfully')
      adjustmentForm.reset()
      setIsAdjustmentDialogOpen(false)
      setSelectedBudget(null)
      fetchBudgets()
      fetchStats()
    } catch (error) {
      console.error('Error adjusting budget:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to adjust budget')
    }
  }

  const exportBudgetReport = async () => {
    try {
      const params = new URLSearchParams()
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      if (periodFilter !== 'all') params.append('period', periodFilter)
      params.append('export', 'true')
      
      const response = await fetch(`/api/budgets/export?${params}`)
      if (!response.ok) throw new Error('Failed to export budget report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budget-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Budget report exported successfully')
    } catch (error) {
      console.error('Error exporting budget report:', error)
      toast.error('Failed to export budget report')
    }
  }

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.budgetPeriod.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getUtilizationPercentage = (budget: DepartmentBudget) => {
    return budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 80) return 'text-orange-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 text-red-800'
    if (percentage >= 90) return 'bg-red-100 text-red-700'
    if (percentage >= 80) return 'bg-orange-100 text-orange-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusBadge = (budget: DepartmentBudget) => {
    const percentage = getUtilizationPercentage(budget)
    
    if (percentage >= 100) {
      return <Badge className="bg-red-100 text-red-800">Over Budget</Badge>
    } else if (percentage >= 90) {
      return <Badge className="bg-red-100 text-red-700">Critical</Badge>
    } else if (percentage >= 80) {
      return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>
    } else if (budget.isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    }
  }

  const getAlertIcon = (type: 'WARNING' | 'CRITICAL' | 'INFO') => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'INFO':
        return <Bell className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Check permissions for UI elements
  const canCreateBudgets = permissions.hasPermission('CREATE_BUDGETS')
  const canEditBudgets = permissions.hasPermission('EDIT_BUDGETS')
  const canAdjustBudgets = permissions.hasPermission('ADJUST_BUDGETS')
  const canDeleteBudgets = permissions.hasPermission('DELETE_BUDGETS')

  if (!permissions.hasPermission('VIEW_BUDGETS')) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have permission to view budgets. Contact your administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Tracking & Management</h1>
          <p className="text-muted-foreground">
            Monitor departmental budgets, track spending patterns, and manage financial allocations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportBudgetReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          {canCreateBudgets && (
            <>
              <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Import
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Departmental Budget</DialogTitle>
                    <DialogDescription>
                      Create a new budget allocation for a department and period
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...budgetForm}>
                    <form onSubmit={budgetForm.handleSubmit(onBudgetSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={budgetForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Outreach">Outreach</SelectItem>
                                  <SelectItem value="Therapy">Therapy</SelectItem>
                                  <SelectItem value="IT">IT</SelectItem>
                                  <SelectItem value="Media">Media</SelectItem>
                                  <SelectItem value="Finance">Finance</SelectItem>
                                  <SelectItem value="Admin">Admin</SelectItem>
                                  <SelectItem value="Research">Research</SelectItem>
                                  <SelectItem value="Training">Training</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={budgetForm.control}
                          name="budgetPeriod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget Period *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select period" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="2025-01">January 2025</SelectItem>
                                  <SelectItem value="2025-02">February 2025</SelectItem>
                                  <SelectItem value="2025-03">March 2025</SelectItem>
                                  <SelectItem value="2025-04">April 2025</SelectItem>
                                  <SelectItem value="2025-05">May 2025</SelectItem>
                                  <SelectItem value="2025-06">June 2025</SelectItem>
                                  <SelectItem value="2025-Q1">Q1 2025</SelectItem>
                                  <SelectItem value="2025-Q2">Q2 2025</SelectItem>
                                  <SelectItem value="2025-Q3">Q3 2025</SelectItem>
                                  <SelectItem value="2025-Q4">Q4 2025</SelectItem>
                                  <SelectItem value="2025">Annual 2025</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={budgetForm.control}
                        name="allocatedAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allocated Amount (UGX) *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the total budget allocation for this department and period
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Budget
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {stats.totalAllocated.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {stats.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAllocated > 0 ? ((stats.totalSpent / stats.totalAllocated) * 100).toFixed(1) : 0}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {stats.totalRemaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overBudgetDepartments}
            </div>
            <p className="text-xs text-muted-foreground">
              Over budget • {stats.nearLimitDepartments} near limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts Section */}
      {alertsVisible && budgets.some(budget => budget.alerts && budget.alerts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">Budget Alerts</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgets
                .filter(budget => budget.alerts && budget.alerts.length > 0)
                .slice(0, 5)
                .map(budget => (
                  <div key={budget.id} className="flex items-center space-x-3 p-2 bg-white rounded">
                    {budget.alerts?.[0] && getAlertIcon(budget.alerts[0].type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{budget.department} - {formatPeriod(budget.budgetPeriod)}</div>
                      <div className="text-sm text-orange-700">
                        {budget.alerts[0].message}
                      </div>
                    </div>
                    <Badge className={getUtilizationBadge(getUtilizationPercentage(budget))}>
                      {getUtilizationPercentage(budget).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by department or period..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Outreach">Outreach</SelectItem>
                <SelectItem value="Therapy">Therapy</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="2025-01">January 2025</SelectItem>
                <SelectItem value="2025-02">February 2025</SelectItem>
                <SelectItem value="2025-03">March 2025</SelectItem>
                <SelectItem value="2025-04">April 2025</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="over-budget">Over Budget</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="on-track">On Track</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchBudgets}>
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Allocated</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredBudgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No budgets found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBudgets.map((budget) => {
                    const utilization = getUtilizationPercentage(budget)
                    return (
                      <TableRow key={budget.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{budget.department}</div>
                            <div className="text-sm text-muted-foreground">
                              {budget._count.expenses} expenses
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatPeriod(budget.budgetPeriod)}</TableCell>
                        <TableCell className="font-medium">
                          UGX {budget.allocatedAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          UGX {budget.spentAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          UGX {budget.remainingAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className={getUtilizationColor(utilization)}>
                                {utilization.toFixed(1)}%
                              </span>
                              <Badge className={getUtilizationBadge(utilization)}>
                                {utilization >= 100 ? 'Over' : utilization >= 90 ? 'Critical' : utilization >= 80 ? 'High' : utilization >= 60 ? 'Medium' : 'Low'}
                              </Badge>
                            </div>
                            <Progress value={Math.min(utilization, 100)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(budget)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {canAdjustBudgets && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBudget(budget)
                                  setIsAdjustmentDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {canDeleteBudgets && (
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Adjustment Dialog */}
      <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust Budget</DialogTitle>
            <DialogDescription>
              Make adjustments to the selected department budget
            </DialogDescription>
          </DialogHeader>
          
          {selectedBudget && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">{selectedBudget.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Period</Label>
                  <p className="text-sm text-muted-foreground">{formatPeriod(selectedBudget.budgetPeriod)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Allocation</Label>
                  <p className="text-sm text-muted-foreground">
                    UGX {selectedBudget.allocatedAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Spent Amount</Label>
                  <p className="text-sm text-muted-foreground">
                    UGX {selectedBudget.spentAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <Form {...adjustmentForm}>
                <form onSubmit={adjustmentForm.handleSubmit(onAdjustmentSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={adjustmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adjustment Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TOP_UP">Top Up (Increase)</SelectItem>
                              <SelectItem value="REDUCTION">Reduction (Decrease)</SelectItem>
                              <SelectItem value="CORRECTION">Correction</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adjustmentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adjustment Amount (UGX) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={adjustmentForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Adjustment *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explain why this adjustment is needed..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a clear justification for this budget adjustment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAdjustmentDialogOpen(false)
                        setSelectedBudget(null)
                        adjustmentForm.reset()
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Apply Adjustment
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Budgets</DialogTitle>
            <DialogDescription>
              Import multiple budget allocations using a CSV file. Download the template first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="bulk-budget-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload CSV file
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    CSV files up to 10MB
                  </span>
                </Label>
                <input
                  id="bulk-budget-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
                Cancel
              </Button>
              <Button>
                Upload & Process
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}