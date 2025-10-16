'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  BarChart3,
  Activity
} from 'lucide-react'
import { CheckInOutCard } from './check-in-out-card'
import { DailyTaskLogs } from './daily-task-logs'
import { AttendanceStatus } from './attendance-status'
import { WorkSummary } from './work-summary'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface AttendanceStats {
  today: {
    checkedIn: boolean
    checkInTime?: string
    workingHours?: number
  }
  thisWeek: {
    daysPresent: number
    totalHours: number
    avgHoursPerDay: number
  }
  thisMonth: {
    daysPresent: number
    daysAbsent: number
    attendanceRate: number
    totalHours: number
  }
}

export function AttendanceTrackingDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AttendanceStats>({
    today: {
      checkedIn: false,
    },
    thisWeek: {
      daysPresent: 0,
      totalHours: 0,
      avgHoursPerDay: 0,
    },
    thisMonth: {
      daysPresent: 0,
      daysAbsent: 0,
      attendanceRate: 0,
      totalHours: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [checkInStatus, setCheckInStatus] = useState<any>(null)

  useEffect(() => {
    fetchAttendanceStats()
    fetchCheckInStatus()
  }, [])

  const fetchAttendanceStats = async () => {
    try {
      const month = new Date().toISOString().slice(0, 7)
      const response = await fetch(`/api/attendance/work-summary?month=${month}&generate=true`)
      
      if (response.ok) {
        const data = await response.json()
        const summary = data.summary
        
        setStats({
          today: checkInStatus ? {
            checkedIn: true,
            checkInTime: checkInStatus.checkInTime,
            workingHours: checkInStatus.workingHours,
          } : {
            checkedIn: false,
          },
          thisWeek: {
            daysPresent: Math.floor(summary.daysPresent / 4) || 0, // Rough estimate
            totalHours: summary.totalHours || 0,
            avgHoursPerDay: summary.summaryData?.averageHoursPerDay || 0,
          },
          thisMonth: {
            daysPresent: summary.daysPresent || 0,
            daysAbsent: summary.daysAbsent || 0,
            attendanceRate: summary.attendanceRate || 0,
            totalHours: summary.totalHours || 0,
          },
        })
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error)
      toast.error('Failed to load attendance statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchCheckInStatus = async () => {
    try {
      const response = await fetch('/api/attendance/check-in')
      if (response.ok) {
        const data = await response.json()
        setCheckInStatus(data.checkIn)
      }
    } catch (error) {
      console.error('Error fetching check-in status:', error)
    }
  }

  const canViewTeamAttendance = ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'].includes(
    session?.user?.role || ''
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            Attendance & Work Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your attendance, log daily tasks, and monitor your work progress
          </p>
        </div>
        {canViewTeamAttendance && (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.today.checkedIn ? (
                <Badge variant="default" className="text-base">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Checked In
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-base">
                  <XCircle className="mr-1 h-4 w-4" />
                  Not Checked In
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.today.workingHours 
                ? `${stats.today.workingHours.toFixed(1)} hours worked`
                : 'Check in to start tracking time'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek.daysPresent} Days</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisWeek.totalHours.toFixed(1)} total hours • 
              {stats.thisWeek.avgHoursPerDay.toFixed(1)} avg/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth.daysPresent} / {stats.thisMonth.daysPresent + stats.thisMonth.daysAbsent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonth.attendanceRate.toFixed(0)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth.totalHours.toFixed(0)}h</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="check-in" className="gap-2">
            <Clock className="h-4 w-4" />
            Check In/Out
          </TabsTrigger>
          <TabsTrigger value="task-logs" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Task Logs
          </TabsTrigger>
          {canViewTeamAttendance && (
            <TabsTrigger value="team-status" className="gap-2">
              <Users className="h-4 w-4" />
              Team Status
            </TabsTrigger>
          )}
          <TabsTrigger value="summary" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Work Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="check-in" className="mt-6">
          <CheckInOutCard 
            checkInStatus={checkInStatus}
            onCheckInOut={fetchCheckInStatus}
          />
        </TabsContent>

        <TabsContent value="task-logs" className="mt-6">
          <DailyTaskLogs />
        </TabsContent>

        {canViewTeamAttendance && (
          <TabsContent value="team-status" className="mt-6">
            <AttendanceStatus />
          </TabsContent>
        )}

        <TabsContent value="summary" className="mt-6">
          <WorkSummary />
        </TabsContent>
      </Tabs>
    </div>
  )
}
