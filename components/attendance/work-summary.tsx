'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar,
  Download,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Loader2,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface WorkSummaryData {
  userId: string
  month: string
  totalDays: number
  daysPresent: number
  daysAbsent: number
  totalHours: number
  tasksCompleted: number
  attendanceRate: number
  summaryData?: {
    averageHoursPerDay: number
    checkInCount: number
    taskLogsCount: number
    approvedLogsCount: number
    lateCheckIns: number
  }
  user: {
    name: string
    email: string
    department?: string
    jobTitle?: string
  }
}

export function WorkSummary() {
  const [summary, setSummary] = useState<WorkSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => {
    fetchSummary()
  }, [selectedMonth])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/attendance/work-summary?month=${selectedMonth}&generate=true`)
      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
      } else {
        throw new Error('Failed to fetch')
      }
    } catch (error) {
      toast.error('Failed to load work summary')
    } finally {
      setLoading(false)
    }
  }

  const generateMonthOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy'),
      })
    }
    return options
  }

  const exportSummary = () => {
    if (!summary) return
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Month', format(new Date(summary.month), 'MMMM yyyy')],
      ['Employee', summary.user.name],
      ['Department', summary.user.department || 'N/A'],
      ['Total Days', summary.totalDays.toString()],
      ['Days Present', summary.daysPresent.toString()],
      ['Days Absent', summary.daysAbsent.toString()],
      ['Attendance Rate', `${summary.attendanceRate}%`],
      ['Total Hours', summary.totalHours.toFixed(1)],
      ['Average Hours/Day', summary.summaryData?.averageHoursPerDay.toFixed(1) || '0'],
      ['Tasks Completed', summary.tasksCompleted.toString()],
      ['Late Check-ins', summary.summaryData?.lateCheckIns.toString() || '0'],
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `work-summary-${summary.month}.csv`
    a.click()
    toast.success('Summary exported successfully')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          No summary available for this period
        </CardContent>
      </Card>
    )
  }

  const attendanceGrade = 
    summary.attendanceRate >= 95 ? 'Excellent' :
    summary.attendanceRate >= 85 ? 'Good' :
    summary.attendanceRate >= 75 ? 'Fair' : 'Needs Improvement'

  const attendanceColor =
    summary.attendanceRate >= 95 ? 'text-green-600' :
    summary.attendanceRate >= 85 ? 'text-blue-600' :
    summary.attendanceRate >= 75 ? 'text-orange-600' : 'text-red-600'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Work Summary
              </CardTitle>
              <CardDescription>
                Comprehensive overview of your attendance and work activities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportSummary} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${attendanceColor}`}>
              {summary.attendanceRate.toFixed(1)}%
            </div>
            <Badge variant="outline" className="mt-2">{attendanceGrade}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.daysPresent}</div>
            <p className="text-sm text-muted-foreground mt-1">
              out of {summary.totalDays} working days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalHours.toFixed(0)}h</div>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.summaryData?.averageHoursPerDay.toFixed(1)}h avg per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.tasksCompleted}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.summaryData?.approvedLogsCount} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Days Present</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{summary.daysPresent}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                <span className="font-medium">Days Absent</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{summary.daysAbsent}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Late Check-ins</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {summary.summaryData?.lateCheckIns || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Check-ins</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {summary.summaryData?.checkInCount || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Task Logs</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {summary.summaryData?.taskLogsCount || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                <span className="font-medium">Avg Hours/Day</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">
                {summary.summaryData?.averageHoursPerDay.toFixed(1) || 0}h
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{summary.user.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{summary.user.email}</p>
              {summary.user.department && (
                <p className="text-sm text-muted-foreground">
                  {summary.user.department} {summary.user.jobTitle && `• ${summary.user.jobTitle}`}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {format(new Date(summary.month), 'MMMM yyyy')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
