'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserPlus, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { EmployeeManagement } from './employee-management'
import { Recruitment } from './recruitment'
import { EventsManagement } from './events-management'

interface HRStats {
  totalEmployees: number
  activeEmployees: number
  newHires: number
  pendingApprovals: number
  totalSystemUsers: number
  activeSystemUsers: number
  pendingSystemUsers: number
  upcomingReviews: number
  openPositions: number
  trainingCompleted: number
  performanceReviews: number
  pendingLeaveRequests: number
  approvedLeaveRequests: number
  departmentBreakdown: Array<{ department: string; count: number }>
  employmentTypeBreakdown: Array<{ type: string; count: number }>
  recentActivity: {
    newEmployees: number
    newSystemUsers: number
  }
}

export function HRDashboard() {
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    newHires: 0,
    pendingApprovals: 0,
    totalSystemUsers: 0,
    activeSystemUsers: 0,
    pendingSystemUsers: 0,
    upcomingReviews: 0,
    openPositions: 0,
    trainingCompleted: 0,
    performanceReviews: 0,
    pendingLeaveRequests: 0,
    approvedLeaveRequests: 0,
    departmentBreakdown: [],
    employmentTypeBreakdown: [],
    recentActivity: {
      newEmployees: 0,
      newSystemUsers: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHRStats()
  }, [])

  const fetchHRStats = async () => {
    try {
      const response = await fetch('/api/hr/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch HR stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching HR stats:', error)
      // Fallback to mock data if API fails
      setStats({
        totalEmployees: 0,
        activeEmployees: 0,
        newHires: 0,
        pendingApprovals: 0,
        totalSystemUsers: 0,
        activeSystemUsers: 0,
        pendingSystemUsers: 0,
        upcomingReviews: 0,
        openPositions: 0,
        trainingCompleted: 0,
        performanceReviews: 0,
        pendingLeaveRequests: 0,
        approvedLeaveRequests: 0,
        departmentBreakdown: [],
        employmentTypeBreakdown: [],
        recentActivity: {
          newEmployees: 0,
          newSystemUsers: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Human Resources Management</h1>
        <p className="text-muted-foreground">
          Comprehensive HR management system for employee lifecycle, recruitment, and workforce analytics
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeEmployees} active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Hires</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newHires}</div>
            <p className="text-xs text-muted-foreground">Added to employee directory this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Active users not yet added as employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSystemUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingSystemUsers} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openPositions}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-orange-800">Action Required</CardTitle>
            </div>
            <CardDescription className="text-orange-700">
              {stats.pendingApprovals} active system users need to be added to employee directory
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Upcoming Reviews</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              {stats.upcomingReviews} performance reviews scheduled this month
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="mt-6">
          <EmployeeManagement />
        </TabsContent>

        <TabsContent value="recruitment" className="mt-6">
          <Recruitment />
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <EventsManagement />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Management</CardTitle>
              <CardDescription>
                Track employee performance, reviews, and development goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Performance management interface will be displayed here</p>
                <p className="text-sm">Full functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training & Development</CardTitle>
              <CardDescription>
                Manage employee training programs and skill development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-4" />
                <p>Training management interface will be displayed here</p>
                <p className="text-sm">Full functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>HR Policies & Documents</CardTitle>
              <CardDescription>
                Manage company policies, handbooks, and HR documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Policy management interface will be displayed here</p>
                <p className="text-sm">Full functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>HR Analytics & Reports</CardTitle>
              <CardDescription>
                Workforce analytics, trends, and comprehensive HR reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics dashboard will be displayed here</p>
                <p className="text-sm">Full functionality coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}