"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Target,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { format, subDays, subWeeks, subMonths } from "date-fns"
import { toast } from "sonner"

interface ProjectAnalyticsProps {
  projects: Array<{
    id: string
    name: string
    status: string
    priority: string
    department?: string
    startDate?: string
    endDate?: string
    members?: Array<{
      id: string
      firstName: string
      lastName: string
    }>
    milestones?: Array<{
      id: string
      title: string
      dueDate: string
      progress: number
      status: string
    }>
    progressUpdates?: Array<{
      id: string
      progressPercentage: number
      createdAt: string
    }>
  }>
}

export function ProjectAnalytics({ projects }: ProjectAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [department, setDepartment] = useState<string>('all')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date()
    const timeRangeDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange]

    const startDate = subDays(now, timeRangeDays)
    
    // Filter projects by department
    const filteredProjects = department === 'all' 
      ? projects 
      : projects.filter(p => p.department === department)

    // Project completion rate by department
    const departmentStats = projects.reduce((acc, project) => {
      const dept = project.department || 'Other'
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0, active: 0, delayed: 0 }
      }
      acc[dept].total++
      if (project.status === 'COMPLETED') acc[dept].completed++
      if (project.status === 'ACTIVE') acc[dept].active++
      if (project.endDate && new Date(project.endDate) < now && project.status !== 'COMPLETED') {
        acc[dept].delayed++
      }
      return acc
    }, {} as Record<string, { total: number; completed: number; active: number; delayed: number }>)

    // Active vs Completed projects
    const statusStats = filteredProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Delayed milestones trend
    const delayedMilestones = filteredProjects.reduce((acc, project) => {
      if (project.milestones) {
        project.milestones.forEach(milestone => {
          const dueDate = new Date(milestone.dueDate)
          if (dueDate < now && milestone.status !== 'COMPLETED') {
            acc.push({
              projectName: project.name,
              milestoneTitle: milestone.title,
              daysOverdue: Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            })
          }
        })
      }
      return acc
    }, [] as Array<{ projectName: string; milestoneTitle: string; daysOverdue: number }>)

    // Average progress per department
    const avgProgressByDept = Object.keys(departmentStats).map(dept => {
      const deptProjects = projects.filter(p => (p.department || 'Other') === dept)
      const totalProgress = deptProjects.reduce((sum, project) => {
        if (project.milestones && project.milestones.length > 0) {
          const avgProgress = project.milestones.reduce((milestoneSum, milestone) => 
            milestoneSum + milestone.progress, 0) / project.milestones.length
          return sum + avgProgress
        }
        return sum
      }, 0)
      return {
        department: dept,
        averageProgress: deptProjects.length > 0 ? totalProgress / deptProjects.length : 0
      }
    })

    // Recent progress updates
    const recentUpdates = filteredProjects.reduce((acc, project) => {
      if (project.progressUpdates) {
        project.progressUpdates.forEach(update => {
          if (new Date(update.createdAt) >= startDate) {
            acc.push({
              projectName: project.name,
              progress: update.progressPercentage,
              date: update.createdAt
            })
          }
        })
      }
      return acc
    }, [] as Array<{ projectName: string; progress: number; date: string }>)

    return {
      departmentStats,
      statusStats,
      delayedMilestones,
      avgProgressByDept,
      recentUpdates,
      totalProjects: filteredProjects.length,
      completedProjects: statusStats.COMPLETED || 0,
      activeProjects: statusStats.ACTIVE || 0,
      delayedProjects: Object.values(departmentStats).reduce((sum, dept) => sum + dept.delayed, 0)
    }
  }

  const analytics = calculateAnalytics()

  const generateReport = async () => {
    setIsGeneratingReport(true)
    try {
      // TODO: Implement report generation API
      console.log('Generating report for:', { timeRange, department })
      toast.success("Report generated successfully")
    } catch (error) {
      toast.error("Failed to generate report")
      console.error("Error generating report:", error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'ACTIVE':
        return 'text-blue-600'
      case 'ON_HOLD':
        return 'text-yellow-600'
      case 'CANCELLED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-blue-600'
    if (progress >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into project performance and team productivity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Time Range:</label>
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Department:</label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="OUTREACH">Outreach</SelectItem>
              <SelectItem value="THERAPY">Therapy</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="RESEARCH">Research</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalProjects > 0 
                ? Math.round((analytics.completedProjects / analytics.totalProjects) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Projects</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.delayedProjects}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Milestones</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.delayedMilestones.length}</div>
            <p className="text-xs text-muted-foreground">
              Overdue items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Completion Rate by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Completion Rate by Department
            </CardTitle>
            <CardDescription>
              Project completion rates across different departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.departmentStats).map(([dept, stats]) => {
                const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{dept}</span>
                      <span className={getProgressColor(completionRate)}>
                        {Math.round(completionRate)}%
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stats.completed} completed</span>
                      <span>{stats.total} total</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active vs Completed Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of all projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.statusStats).map(([status, count]) => {
                const percentage = analytics.totalProjects > 0 ? (count / analytics.totalProjects) * 100 : 0
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'COMPLETED' ? 'bg-green-500' :
                        status === 'ACTIVE' ? 'bg-blue-500' :
                        status === 'ON_HOLD' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium">{status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count}</span>
                      <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Average Progress by Department */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Average Progress by Department
            </CardTitle>
            <CardDescription>
              Current progress levels across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.avgProgressByDept.map(({ department, averageProgress }) => (
                <div key={department} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{department}</span>
                    <span className={getProgressColor(averageProgress)}>
                      {Math.round(averageProgress)}%
                    </span>
                  </div>
                  <Progress value={averageProgress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delayed Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delayed Milestones
            </CardTitle>
            <CardDescription>
              Milestones that are overdue and need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.delayedMilestones.length > 0 ? (
                analytics.delayedMilestones.slice(0, 5).map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{milestone.milestoneTitle}</p>
                      <p className="text-xs text-muted-foreground">{milestone.projectName}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {milestone.daysOverdue} days overdue
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No delayed milestones</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Progress Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Progress Updates
          </CardTitle>
          <CardDescription>
            Latest progress updates from team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentUpdates.length > 0 ? (
              analytics.recentUpdates.slice(0, 10).map((update, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{update.projectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(update.date), 'MMM d, yyyy at h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16">
                      <Progress value={update.progress} className="h-2" />
                    </div>
                    <span className={`text-sm font-medium ${getProgressColor(update.progress)}`}>
                      {update.progress}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>No recent progress updates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}