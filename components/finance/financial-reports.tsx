'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp, Users, DollarSign, Filter, RefreshCw } from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { toast } from 'sonner'

interface ReportData {
  monthlySummary: {
    totalStipends: number
    totalExpenses: number
    totalBudget: number
    remainingBudget: number
    departmentBreakdown: Array<{
      department: string
      allocated: number
      spent: number
      remaining: number
      utilization: number
    }>
  }
  expenseTrends: Array<{
    month: string
    amount: number
    count: number
  }>
  departmentSpending: Array<{
    department: string
    amount: number
    percentage: number
  }>
  topExpenses: Array<{
    id: string
    purpose: string
    amount: number
    department: string
    requester: string
    status: string
  }>
}

export function FinancialReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [customDateRange, setCustomDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [selectedPeriod, selectedDepartment])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      
      // This would fetch from a dedicated reports API endpoint
      // For now, we'll use mock data
      const mockData: ReportData = {
        monthlySummary: {
          totalStipends: 2500000,
          totalExpenses: 1800000,
          totalBudget: 5000000,
          remainingBudget: 700000,
          departmentBreakdown: [
            { department: 'Outreach', allocated: 1500000, spent: 1200000, remaining: 300000, utilization: 80 },
            { department: 'Therapy', allocated: 1000000, spent: 800000, remaining: 200000, utilization: 80 },
            { department: 'IT', allocated: 800000, spent: 600000, remaining: 200000, utilization: 75 },
            { department: 'Media', allocated: 700000, spent: 500000, remaining: 200000, utilization: 71 },
            { department: 'Finance', allocated: 500000, spent: 300000, remaining: 200000, utilization: 60 },
            { department: 'Admin', allocated: 500000, spent: 200000, remaining: 300000, utilization: 40 }
          ]
        },
        expenseTrends: [
          { month: 'Jan', amount: 1200000, count: 45 },
          { month: 'Feb', amount: 1500000, count: 52 },
          { month: 'Mar', amount: 1800000, count: 48 },
          { month: 'Apr', amount: 1600000, count: 41 },
          { month: 'May', amount: 1900000, count: 55 },
          { month: 'Jun', amount: 1700000, count: 49 }
        ],
        departmentSpending: [
          { department: 'Outreach', amount: 1200000, percentage: 40 },
          { department: 'Therapy', amount: 800000, percentage: 27 },
          { department: 'IT', amount: 600000, percentage: 20 },
          { department: 'Media', amount: 500000, percentage: 17 },
          { department: 'Finance', amount: 300000, percentage: 10 },
          { department: 'Admin', amount: 200000, percentage: 7 }
        ],
        topExpenses: [
          { id: '1', purpose: 'Client Outreach Event', amount: 250000, department: 'Outreach', requester: 'John Doe', status: 'PAID' },
          { id: '2', purpose: 'Equipment Purchase', amount: 180000, department: 'IT', requester: 'Jane Smith', status: 'PAID' },
          { id: '3', purpose: 'Training Workshop', amount: 150000, department: 'Therapy', requester: 'Mike Johnson', status: 'APPROVED' },
          { id: '4', purpose: 'Marketing Materials', amount: 120000, department: 'Media', requester: 'Sarah Wilson', status: 'PAID' },
          { id: '5', purpose: 'Office Supplies', amount: 95000, department: 'Admin', requester: 'David Brown', status: 'PENDING' }
        ]
      }
      
      setReportData(mockData)
    } catch (error) {
      console.error('Error fetching report data:', error)
      toast.error('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (reportType: string) => {
    try {
      setIsGenerating(true)
      
      // This would call the actual report generation API
      console.log('Generating report:', reportType, { selectedPeriod, selectedDepartment, customDateRange })
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`${reportType} report generated successfully`)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = (reportType: string) => {
    // This would implement PDF export functionality
    console.log('Exporting to PDF:', reportType)
    toast.success('PDF export initiated')
  }

  const exportToCSV = (reportType: string) => {
    // This would implement CSV export functionality
    console.log('Exporting to CSV:', reportType)
    toast.success('CSV export initiated')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive financial reports and analyze spending patterns
          </p>
        </div>
        <Button onClick={fetchReportData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="period">Report Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="last3">Last 3 Months</SelectItem>
                  <SelectItem value="last6">Last 6 Months</SelectItem>
                  <SelectItem value="last12">Last 12 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="department">Department</Label>
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
              <div className="flex gap-2">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Report Generation Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Monthly Summary</span>
            </CardTitle>
            <CardDescription>
              Complete monthly financial overview with department breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={() => generateReport('Monthly Summary')}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF('Monthly Summary')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Departmental Report</span>
            </CardTitle>
            <CardDescription>
              Department-wise budget and expense analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={() => generateReport('Departmental Report')}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToPDF('Departmental Report')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Expense Ledger</span>
            </CardTitle>
            <CardDescription>
              Detailed expense transaction log with filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                className="flex-1" 
                onClick={() => generateReport('Expense Ledger')}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV('Expense Ledger')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="expenses">Top Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stipends</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  UGX {reportData?.monthlySummary.totalStipends.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  UGX {reportData?.monthlySummary.totalExpenses.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  UGX {reportData?.monthlySummary.totalBudget.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Allocated</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  UGX {reportData?.monthlySummary.remainingBudget.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">Available</p>
              </CardContent>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Utilization</CardTitle>
              <CardDescription>
                Current budget allocation and spending by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.monthlySummary.departmentBreakdown.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-sm text-muted-foreground">
                        {dept.utilization.toFixed(1)}% utilized
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          dept.utilization >= 100 ? 'bg-red-500' :
                          dept.utilization >= 80 ? 'bg-orange-500' :
                          dept.utilization >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(dept.utilization, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Spent: UGX {dept.spent.toLocaleString()}</span>
                      <span>Remaining: UGX {dept.remaining.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
              <CardDescription>
                Monthly expense trends over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Chart visualization would be displayed here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Spending Distribution</CardTitle>
              <CardDescription>
                Percentage breakdown of spending by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Pie chart visualization would be displayed here</p>
                  <p className="text-sm">Integration with charting library needed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Expenses</CardTitle>
              <CardDescription>
                Highest value expense requests this period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.topExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{expense.purpose}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.department} • {expense.requester}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">UGX {expense.amount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{expense.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
