"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  FolderKanban, 
  Heart, 
  Building2, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Plus,
  FileText,
  Settings,
  Download,
  BarChart3,
  PieChart,
  Calendar
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import Link from "next/link"

// Data interfaces
interface KPIData {
  totalPeople: number
  activeProjects: number
  totalVolunteers: number
  totalDepartments: number
  monthlyExpenses: number
  pendingApprovals: number
}

interface UsersByRoleData {
  name: string
  value: number
  color: string
}

interface MonthlyActivityData {
  month: string
  projects: number
  tasks: number
  reports: number
}

interface DepartmentPerformanceData {
  name: string
  score: number
  projects: number
  reports: number
}

interface NotificationData {
  id: number
  type: string
  message: string
  time: string
  urgent: boolean
}

interface SuperAdminStats {
  kpiData: KPIData
  usersByRoleData: UsersByRoleData[]
  monthlyActivityData: MonthlyActivityData[]
  topDepartments: DepartmentPerformanceData[]
  notifications: NotificationData[]
}
// Default/fallback data
const defaultStats: SuperAdminStats = {
  kpiData: {
    totalPeople: 0,
    activeProjects: 0,
    totalVolunteers: 0,
    totalDepartments: 0,
    monthlyExpenses: 0,
    pendingApprovals: 0
  },
  usersByRoleData: [],
  monthlyActivityData: [],
  topDepartments: [],
  notifications: []
}

const systemHealthScore = 87 // AI-based system health percentage

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSuperAdminStats()
  }, [])

  const fetchSuperAdminStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/super-admin-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch super admin stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching super admin stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <SuperAdminDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load dashboard data: {error}</p>
              <Button onClick={fetchSuperAdminStats} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { kpiData, usersByRoleData, monthlyActivityData, topDepartments, notifications } = stats
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete organizational overview and system control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export IDs
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-[#0B874E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalPeople}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> new this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">
              All active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600">+5%</span> vs budget
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI System Health */}
      <Card className="border-2 border-[#0B874E]/20 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#0B874E]" />
            <CardTitle className="text-lg">AI System Health Monitor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall System Status</span>
                <span className="text-sm text-muted-foreground">{systemHealthScore}%</span>
              </div>
              <Progress value={systemHealthScore} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#0B874E]">Excellent</div>
              <div className="text-xs text-muted-foreground">All systems functional</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            ✅ Database performance optimal • ✅ User engagement high • ⚠️ 3 pending expense approvals
          </div>
        </CardContent>
      </Card>

      {/* Middle Section - Insights & Monitoring */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Users by Role Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Active Users by Role
            </CardTitle>
            <CardDescription>Distribution of users across different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={usersByRoleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usersByRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {usersByRoleData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Departmental Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Activity Trends
            </CardTitle>
            <CardDescription>Projects, tasks, and reports over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="projects" 
                    stackId="1" 
                    stroke="#0B874E" 
                    fill="#0B874E" 
                    fillOpacity={0.8}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    stackId="1" 
                    stroke="#16A34A" 
                    fill="#16A34A" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reports" 
                    stackId="1" 
                    stroke="#22C55E" 
                    fill="#22C55E" 
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              System Notifications
            </CardTitle>
            <CardDescription>Recent alerts and system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.urgent ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  {notification.urgent && (
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Departments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Departments
            </CardTitle>
            <CardDescription>Based on project milestones and report submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDepartments.map((dept, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{dept.name}</span>
                      <span className="text-sm text-muted-foreground">{dept.score}%</span>
                    </div>
                    <Progress value={dept.score} className="h-2" />
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{dept.projects} projects</span>
                      <span>{dept.reports} reports</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Frequently used administrative functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/dashboard/teams">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Add New Department
              </Button>
            </Link>
            <Link href="/dashboard/projects">
              <Button variant="outline" className="w-full justify-start">
                <FolderKanban className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View All Reports
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Manage Access Levels
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SuperAdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}