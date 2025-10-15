'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Filter, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Users, Calendar, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

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
}

export function BudgetTracking() {
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<DepartmentBudget | null>(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const params = new URLSearchParams()
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      if (periodFilter !== 'all') params.append('period', periodFilter)
      
      const response = await fetch(`/api/budgets?${params}`)
      const data = await response.json()
      setBudgets(data.budgets || [])
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to fetch budgets')
    } finally {
      setLoading(false)
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
    if (percentage >= 80) return 'text-orange-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-100 text-red-800'
    if (percentage >= 80) return 'bg-orange-100 text-orange-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusBadge = (budget: DepartmentBudget) => {
    const percentage = getUtilizationPercentage(budget)
    const isOverBudget = percentage >= 100
    const isNearLimit = percentage >= 80
    
    if (isOverBudget) {
      return <Badge className="bg-red-100 text-red-800">Over Budget</Badge>
    } else if (isNearLimit) {
      return <Badge className="bg-orange-100 text-orange-800">Near Limit</Badge>
    } else if (budget.isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    }
  }

  const formatPeriod = (period: string) => {
    // Convert "2025-01" to "January 2025"
    const [year, month] = period.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Tracking</h1>
          <p className="text-muted-foreground">
            Monitor departmental budgets and spending patterns
          </p>
        </div>
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
                Create a new budget allocation for a department
              </DialogDescription>
            </DialogHeader>
            {/* Add Budget Form would go here */}
            <div className="p-4 text-center text-muted-foreground">
              Add Budget Form Component
            </div>
          </DialogContent>
        </Dialog>
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
              UGX {budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0).toLocaleString()}
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
              UGX {budgets.reduce((sum, budget) => sum + budget.spentAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(budget => getUtilizationPercentage(budget) >= 100).length}
            </div>
            <p className="text-xs text-muted-foreground">Departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      {budgets.some(budget => getUtilizationPercentage(budget) >= 80) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Budget Alerts</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              {budgets.filter(budget => getUtilizationPercentage(budget) >= 80).length} department(s) are at or near their budget limit
            </CardDescription>
          </CardHeader>
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
                                {utilization >= 100 ? 'Over' : utilization >= 80 ? 'High' : utilization >= 60 ? 'Medium' : 'Low'}
                              </Badge>
                            </div>
                            <Progress value={Math.min(utilization, 100)} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(budget)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
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
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm text-muted-foreground">{selectedBudget.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Allocation</Label>
                  <p className="text-sm text-muted-foreground">
                    UGX {selectedBudget.allocatedAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="adjustment-amount">Adjustment Amount</Label>
                <Input
                  id="adjustment-amount"
                  type="number"
                  placeholder="Enter amount (positive for increase, negative for decrease)"
                />
              </div>
              
              <div>
                <Label htmlFor="adjustment-reason">Reason for Adjustment</Label>
                <Textarea
                  id="adjustment-reason"
                  placeholder="Explain why this adjustment is needed..."
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAdjustmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Apply Adjustment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
