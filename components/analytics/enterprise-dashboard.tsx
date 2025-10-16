"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Calendar,
  DollarSign,
  Target,
  Activity,
  Award,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from "lucide-react"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"

interface DashboardData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalProjects: number
    activeProjects: number
    completedTasks: number
    totalTasks: number
    taskCompletionRate: number
    recentCheckIns: number
    averageAttendance: number
  }
  trends: {
    userGrowth: Array<{
      month: string
      totalUsers: number
      activeUsers: number
    }>
    taskCompletion: Array<{
      week: string
      completed: number
    }>
    departmentPerformance: Array<{
      name: string
      userCount: number
    }>
  }
  timeRange: string
  lastUpdated: string
}

const COLORS = ['#0B874E', '#16A34A', '#22C55E', '#4ADE80', '#86EFAC']

export function EnterpriseDashboard() {
  const permissions = usePermissions()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [department, setDepartment] = useState<string>('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        timeRange,
        ...(department && { department })
      })
      
      const response = await fetch(`/api/analytics/dashboard?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (permissions.canViewAnalytics) {
      fetchDashboardData()
    }
  }, [timeRange, department, permissions.canViewAnalytics])

  const generateReport = async (reportType: string) => {
    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          dateRange: {
            start: dateRange?.from?.toISOString(),
            end: dateRange?.to?.toISOString()
          },
          departments: department ? [department] : [],
          includeCharts: true,
          format: 'json'
        })
      })

      if (response.ok) {
        const report = await response.json()
        // Handle report download/display
        console.log('Report generated:', report)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    }
  }

  if (!permissions.canViewAnalytics) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 md:px-6">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
                <p className="text-muted-foreground">
                  You don't have permission to access the Enterprise Analytics Dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading || !dashboardData) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-ryd" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ryd">Enterprise Command Center</h2>
          <p className="text-muted-foreground">
            Real-time analytics and comprehensive organizational insights
          </p>
        </div>
        
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              <SelectItem value="Mental Health">Mental Health</SelectItem>
              <SelectItem value="Community Outreach">Community Outreach</SelectItem>
              <SelectItem value="Youth Programs">Youth Programs</SelectItem>
              <SelectItem value="Refugee Support">Refugee Support</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-ryd">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{dashboardData.overview.activeUsers} active</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              of {dashboardData.overview.totalProjects} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.taskCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.overview.completedTasks} of {dashboardData.overview.totalTasks} tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.overview.averageAttendance.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.overview.recentCheckIns} check-ins today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Growth Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-ryd" />
                  User Growth Trend
                </CardTitle>
                <CardDescription>Total and active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dashboardData.trends.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="totalUsers" 
                        fill="#0B874E" 
                        fillOpacity={0.3}
                        stroke="#0B874E"
                        name="Total Users"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="activeUsers" 
                        stroke="#16A34A" 
                        strokeWidth={3}
                        name="Active Users"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-ryd" />
                  Department Distribution
                </CardTitle>
                <CardDescription>User distribution across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.trends.departmentPerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="userCount"
                        nameKey="name"
                      >
                        {dashboardData.trends.departmentPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {dashboardData.trends.departmentPerformance.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{item.name}: {item.userCount}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Task Completion Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-ryd" />
                Task Completion Trends
              </CardTitle>
              <CardDescription>Weekly task completion performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.trends.taskCompletion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#0B874E" name="Completed Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>HR Analytics Report</CardTitle>
                <CardDescription>Comprehensive HR metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('HR_ANALYTICS')} 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate HR Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Project analytics and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('PROJECT_PERFORMANCE')} 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Project Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Report</CardTitle>
                <CardDescription>Attendance and work tracking analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => generateReport('ATTENDANCE')} 
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Attendance Report
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Custom Report Generator</CardTitle>
              <CardDescription>Create custom reports with specific parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Date Range</label>
                  <DateRangePicker dateRange={dateRange} onSelect={setDateRange} />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      <SelectItem value="Mental Health">Mental Health</SelectItem>
                      <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                      <SelectItem value="Youth Programs">Youth Programs</SelectItem>
                      <SelectItem value="Refugee Support">Refugee Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Custom Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {format(new Date(dashboardData.lastUpdated), 'PPpp')}
      </div>
    </div>
  )
}