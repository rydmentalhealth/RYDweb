'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  FileText, 
  Download, 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Target,
  Zap
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { usePermissions } from '@/lib/hooks/usePermissions'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

interface FinancialReport {
  id: string
  reportType: string
  period: string
  title: string
  description?: string
  fileUrl?: string
  data?: any
  generatedBy: {
    id: string
    name: string
  }
  createdAt: string
}

interface ReportData {
  monthlyTrend: Array<{
    month: string
    stipends: number
    expenses: number
    budget: number
    utilization: number
  }>
  departmentBreakdown: Array<{
    department: string
    allocated: number
    spent: number
    remaining: number
    utilization: number
    expenses: number
    stipends: number
  }>
  expenseCategories: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    count: number
    percentage: number
  }>
  approvalMetrics: {
    totalRequests: number
    approved: number
    rejected: number
    pending: number
    averageProcessingTime: number
  }
  budgetAlerts: Array<{
    department: string
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    message: string
    utilization: number
  }>
  topExpenses: Array<{
    id: string
    purpose: string
    amount: number
    category: string
    department: string
    requester: string
    status: string
  }>
  financialSummary: {
    totalRevenue: number
    totalExpenses: number
    totalStipends: number
    totalBudget: number
    netPosition: number
    burnRate: number
    projectedRunway: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658']

export function FinancialReportsAnalytics() {
  const permissions = usePermissions()
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [reportData, setReportData] = useState<ReportData>({
    monthlyTrend: [],
    departmentBreakdown: [],
    expenseCategories: [],
    paymentMethods: [],
    approvalMetrics: {
      totalRequests: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      averageProcessingTime: 0
    },
    budgetAlerts: [],
    topExpenses: [],
    financialSummary: {
      totalRevenue: 0,
      totalExpenses: 0,
      totalStipends: 0,
      totalBudget: 0,
      netPosition: 0,
      burnRate: 0,
      projectedRunway: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  useEffect(() => {
    if (permissions.hasPermission('VIEW_FINANCIAL_REPORTS')) {
      fetchReportData()
      fetchReports()
    }
  }, [permissions, selectedPeriod, selectedDepartment, dateRange])

  const fetchReportData = async () => {
    try {
      const params = new URLSearchParams()
      params.append('period', selectedPeriod)
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment)
      if (dateRange.from) params.append('from', dateRange.from.toISOString())
      if (dateRange.to) params.append('to', dateRange.to.toISOString())
      
      const response = await fetch(`/api/reports/analytics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch report data')
      
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (!response.ok) throw new Error('Failed to fetch reports')
      
      const data = await response.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const generateReport = async (reportType: string) => {
    if (!permissions.hasPermission('GENERATE_FINANCIAL_REPORTS')) {
      toast.error('Insufficient permissions to generate reports')
      return
    }

    try {
      setIsGeneratingReport(true)
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          period: selectedPeriod,
          department: selectedDepartment,
          dateRange: {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString()
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Report generated successfully')
      fetchReports()
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      params.append('period', selectedPeriod)
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment)
      if (dateRange.from) params.append('from', dateRange.from.toISOString())
      if (dateRange.to) params.append('to', dateRange.to.toISOString())
      
      const response = await fetch(`/api/reports/export?${params}`)
      if (!response.ok) throw new Error('Failed to export data')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-data-${format}-${format(new Date(), 'yyyy-MM-dd')}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success(`Data exported as ${format.toUpperCase()} successfully`)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Check permissions for UI elements
  const canGenerateReports = permissions.hasPermission('GENERATE_FINANCIAL_REPORTS')
  const canExportData = permissions.hasPermission('EXPORT_FINANCIAL_DATA')
  const canViewSensitiveData = permissions.hasPermission('VIEW_SENSITIVE_FINANCIAL_DATA')

  if (!permissions.hasPermission('VIEW_FINANCIAL_REPORTS')) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have permission to view financial reports. Contact your administrator for access.
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
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive financial insights, automated reporting, and data-driven analytics
          </p>
        </div>
        <div className="flex space-x-2">
          {canExportData && (
            <>
              <Button variant="outline" onClick={() => exportData('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => exportData('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </>
          )}
          <Button onClick={fetchReportData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || new Date() }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || new Date() }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary Cards */}
      {canViewSensitiveData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.financialSummary.totalBudget)}</div>
              <p className="text-xs text-muted-foreground">Allocated funds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.financialSummary.totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.financialSummary.totalBudget > 0 
                  ? formatPercentage((reportData.financialSummary.totalExpenses / reportData.financialSummary.totalBudget) * 100)
                  : '0%'} of budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Position</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${reportData.financialSummary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reportData.financialSummary.netPosition)}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData.financialSummary.netPosition >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Burn Rate</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.financialSummary.burnRate)}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.financialSummary.projectedRunway} months runway
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Alerts */}
      {reportData.budgetAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Budget Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportData.budgetAlerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                  <div className="flex items-center space-x-3">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{alert.department}</div>
                      <div className="text-sm text-orange-700">{alert.message}</div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {formatPercentage(alert.utilization)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Monthly Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Financial Trend</CardTitle>
              <CardDescription>
                Track budget allocation, spending, and utilization over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={reportData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="budget" stackId="1" stroke="#8884d8" fill="#8884d8" name="Budget" />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Expenses" />
                  <Area type="monotone" dataKey="stipends" stackId="2" stroke="#ffc658" fill="#ffc658" name="Stipends" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Budget Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Utilization</CardTitle>
              <CardDescription>
                Compare budget allocation and spending across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.departmentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#8884d8" name="Allocated" />
                  <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6 space-y-6">
          {/* Expense Categories Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  Breakdown of expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reportData.expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {reportData.expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={reportData.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {reportData.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Approval Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow Metrics</CardTitle>
              <CardDescription>
                Track the efficiency of the expense approval process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reportData.approvalMetrics.totalRequests}</div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reportData.approvalMetrics.approved}</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{reportData.approvalMetrics.rejected}</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{reportData.approvalMetrics.pending}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold">
                  Average Processing Time: {reportData.approvalMetrics.averageProcessingTime} hours
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Financial Overview</CardTitle>
              <CardDescription>
                Detailed financial breakdown by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Allocated</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Expenses</TableHead>
                      <TableHead>Stipends</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.departmentBreakdown.map((dept) => (
                      <TableRow key={dept.department}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{formatCurrency(dept.allocated)}</TableCell>
                        <TableCell>{formatCurrency(dept.spent)}</TableCell>
                        <TableCell>{formatCurrency(dept.remaining)}</TableCell>
                        <TableCell>
                          <Badge className={dept.utilization >= 90 ? 'bg-red-100 text-red-800' : 
                                          dept.utilization >= 80 ? 'bg-orange-100 text-orange-800' : 
                                          'bg-green-100 text-green-800'}>
                            {formatPercentage(dept.utilization)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(dept.expenses)}</TableCell>
                        <TableCell>{formatCurrency(dept.stipends)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Expenses</CardTitle>
              <CardDescription>
                Highest value expense requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.topExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.purpose}</TableCell>
                        <TableCell>{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell>{expense.department}</TableCell>
                        <TableCell>{expense.requester}</TableCell>
                        <TableCell>
                          <Badge className={
                            expense.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            expense.status === 'APPROVED_BY_FINANCE' ? 'bg-blue-100 text-blue-800' :
                            expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {expense.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <div className="space-y-6">
            {/* Generate Reports Section */}
            {canGenerateReports && (
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>
                    Create automated financial reports for different stakeholders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => generateReport('MONTHLY_SUMMARY')}
                      disabled={isGeneratingReport}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <BarChart3 className="h-6 w-6 mb-2" />
                      Monthly Summary
                    </Button>
                    <Button 
                      onClick={() => generateReport('DEPARTMENTAL_REPORT')}
                      disabled={isGeneratingReport}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <Building2 className="h-6 w-6 mb-2" />
                      Departmental Report
                    </Button>
                    <Button 
                      onClick={() => generateReport('EXPENSE_LEDGER')}
                      disabled={isGeneratingReport}
                      className="h-20 flex flex-col items-center justify-center"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Expense Ledger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Previously generated financial reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Generated By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No reports generated yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        reports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.title}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {report.reportType.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{report.period}</TableCell>
                            <TableCell>{report.generatedBy.name}</TableCell>
                            <TableCell>{format(new Date(report.createdAt), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>
                              {report.fileUrl && (
                                <Button variant="ghost" size="sm">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}