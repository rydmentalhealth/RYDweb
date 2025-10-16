"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  CheckCircle, 
  Building2, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  MessageSquare
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Link from "next/link"

// Data interfaces
interface KPIData {
  totalTeamMembers: number
  volunteersActiveThisWeek: number
  pendingOnboardings: number
  tasksCompletedToday: number
  departmentalUpdatesLogged: number
}

interface EngagementData {
  week: string
  engagement: number
  updates: number
}

interface ActivityData {
  day: string
  attendance: number
  tasks: number
}

interface NotificationData {
  id: number
  type: string
  message: string
  urgent: boolean
}

interface AdminStats {
  kpiData: KPIData
  engagementData: EngagementData[]
  activityData: ActivityData[]
  notifications: NotificationData[]
}
// Default/fallback data
const defaultStats: AdminStats = {
  kpiData: {
    totalTeamMembers: 0,
    volunteersActiveThisWeek: 0,
    pendingOnboardings: 0,
    tasksCompletedToday: 0,
    departmentalUpdatesLogged: 0
  },
  engagementData: [],
  activityData: [],
  notifications: []
}

const recentUpdates = [
  { 
    id: 1, 
    user: 'Sarah Nakato', 
    department: 'Mental Health', 
    update: 'Completed 5 counseling sessions this week',
    time: '2 hours ago',
    avatar: '/avatars/sarah.jpg'
  },
  { 
    id: 2, 
    user: 'James Okello', 
    department: 'Community Outreach', 
    update: 'Organized community meeting with 45 attendees',
    time: '4 hours ago',
    avatar: '/avatars/james.jpg'
  },
  { 
    id: 3, 
    user: 'Grace Namuli', 
    department: 'Youth Programs', 
    update: 'Youth workshop completed - 20 participants',
    time: '6 hours ago',
    avatar: '/avatars/grace.jpg'
  }
]

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/admin-stats')
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AdminDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load dashboard data: {error}</p>
              <Button onClick={fetchAdminStats} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { kpiData, engagementData, activityData, notifications } = stats

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-muted-foreground">HR & Operations Management Center</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate HR Summary
          </Button>
          <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Person
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-[#0B874E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalTeamMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.volunteersActiveThisWeek}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Onboarding</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.pendingOnboardings}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.tasksCompletedToday}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dept. Updates</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.departmentalUpdatesLogged}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section - Charts and Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Volunteer Engagement Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Volunteer Engagement Rate
            </CardTitle>
            <CardDescription>Weekly engagement and update submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#0B874E" 
                    strokeWidth={3}
                    dot={{ fill: '#0B874E' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="updates" 
                    stroke="#16A34A" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Overview (Last 7 Days) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity Overview
            </CardTitle>
            <CardDescription>Attendance and task completion patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#0B874E" />
                  <Bar dataKey="tasks" fill="#16A34A" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              HR Alerts
            </CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    alert.urgent ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                  {alert.urgent && (
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR and admin tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/team">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Person
                </Button>
              </Link>
              <Link href="/dashboard/finance">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Approve Expense
                </Button>
              </Link>
              <Link href="/dashboard/teams">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Assign Department Roles
                </Button>
              </Link>
              <Link href="/dashboard/onboarding">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Onboarding Checklist
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Staff Updates Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Latest Staff Updates
          </CardTitle>
          <CardDescription>Recent submissions from team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="flex items-start gap-4 p-4 rounded-lg border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={update.avatar} alt={update.user} />
                  <AvatarFallback>{update.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{update.user}</span>
                    <Badge variant="secondary" className="text-xs">{update.department}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{update.update}</p>
                  <span className="text-xs text-muted-foreground">{update.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/dashboard/team">
              <Button variant="outline" size="sm">
                View All Updates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* HR Notes & Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            HR Notes & Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-medium">Monthly Team Meeting</p>
              <p className="text-xs text-muted-foreground">Scheduled for Friday, 2:00 PM - All department heads required</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-medium">New Volunteer Orientation</p>
              <p className="text-xs text-muted-foreground">8 new volunteers starting next week - prepare welcome materials</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm font-medium">Expense Report Deadline</p>
              <p className="text-xs text-muted-foreground">All department expense reports due by end of week</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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