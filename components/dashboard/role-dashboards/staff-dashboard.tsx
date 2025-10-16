"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FolderKanban, 
  Calendar, 
  CheckCircle, 
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  MessageSquare,
  Building2,
  ExternalLink,
  Plus,
  Send,
  Target
} from "lucide-react"
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from "next/link"

// Mock data - replace with real API calls
const kpiData = {
  assignedProjects: 3,
  tasksDueThisWeek: 7,
  completedTasks: 42,
  attendanceRate: 92,
  recentStipends: 850000 // UGX
}

const monthlyCompletionData = [
  { week: 'Week 1', completed: 8, assigned: 10 },
  { week: 'Week 2', completed: 12, assigned: 14 },
  { week: 'Week 3', completed: 9, assigned: 12 },
  { week: 'Week 4', completed: 13, assigned: 15 }
]

const assignedTasks = [
  { 
    id: 1, 
    title: 'Update client counseling records', 
    project: 'Mental Health Services',
    priority: 'high',
    due: '2 days',
    status: 'in_progress'
  },
  { 
    id: 2, 
    title: 'Prepare youth workshop materials', 
    project: 'Youth Programs',
    priority: 'medium',
    due: '4 days',
    status: 'todo'
  },
  { 
    id: 3, 
    title: 'Community outreach follow-up calls', 
    project: 'Community Engagement',
    priority: 'low',
    due: '1 week',
    status: 'todo'
  },
  { 
    id: 4, 
    title: 'Monthly activity report', 
    project: 'Department Admin',
    priority: 'high',
    due: '3 days',
    status: 'in_progress'
  }
]

const recentActivities = [
  { 
    id: 1, 
    activity: 'Completed 3 individual counseling sessions',
    project: 'Mental Health Services',
    time: '2 hours ago',
    type: 'task_completion'
  },
  { 
    id: 2, 
    activity: 'Submitted weekly department report',
    project: 'Department Admin',
    time: '1 day ago',
    type: 'report_submission'
  },
  { 
    id: 3, 
    activity: 'Attended team coordination meeting',
    project: 'Team Management',
    time: '2 days ago',
    type: 'meeting'
  },
  { 
    id: 4, 
    activity: 'Updated client database with new entries',
    project: 'Data Management',
    time: '3 days ago',
    type: 'data_entry'
  }
]

const hrMessages = [
  {
    id: 1,
    from: 'HR Department',
    subject: 'Monthly Performance Review Scheduled',
    preview: 'Your performance review is scheduled for next Friday at 2:00 PM...',
    time: '1 day ago',
    read: false
  },
  {
    id: 2,
    from: 'Finance Team',
    subject: 'Stipend Payment Processed',
    preview: 'Your monthly stipend has been processed and will be available...',
    time: '3 days ago',
    read: true
  },
  {
    id: 3,
    from: 'Team Lead',
    subject: 'New Project Assignment',
    preview: 'You have been assigned to the new community outreach project...',
    time: '1 week ago',
    read: true
  }
]

const monthlyCompletionRate = 87 // percentage

export function StaffDashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white'
      case 'in_progress': return 'bg-[#0B874E] text-white'
      case 'todo': return 'bg-gray-200 text-gray-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Dashboard</h1>
          <p className="text-muted-foreground">Track your assignments, progress, and contributions to RYD</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Submit Update
          </Button>
          <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
            <DollarSign className="h-4 w-4 mr-2" />
            Request Expense
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-[#0B874E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.assignedProjects}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.tasksDueThisWeek}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.completedTasks}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Stipends</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.recentStipends)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Completion Rate */}
      <Card className="border-2 border-[#0B874E]/20 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#0B874E]" />
            Your Monthly Completion Rate
          </CardTitle>
          <CardDescription>Track your progress and productivity this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="w-24 h-24">
              <CircularProgressbar
                value={monthlyCompletionRate}
                text={`${monthlyCompletionRate}%`}
                styles={buildStyles({
                  textColor: '#0B874E',
                  pathColor: '#0B874E',
                  trailColor: '#E5E7EB'
                })}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#0B874E]">Excellent Performance!</h3>
              <p className="text-muted-foreground">
                You've completed 42 out of 48 assigned tasks this month. Keep up the great work!
              </p>
              <div className="mt-2 text-sm text-muted-foreground">
                ✅ Consistently meeting deadlines • ✅ High quality submissions • 🎯 On track for monthly goals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List and Progress Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              My Current Tasks
            </CardTitle>
            <CardDescription>Tasks assigned to you with completion buttons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border">
                  <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.project}</p>
                        <p className="text-xs text-muted-foreground">Due in {task.due}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        {task.status !== 'completed' && (
                          <Button size="sm" variant="outline" className="text-xs">
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Task Progress
            </CardTitle>
            <CardDescription>Your task completion over the past month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#0B874E" />
                  <Bar dataKey="assigned" fill="#94A3B8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and HR Messages */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Recent Activities
            </CardTitle>
            <CardDescription>Auto-generated activity log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 bg-[#0B874E] rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.activity}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{activity.project}</Badge>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* HR Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Center
            </CardTitle>
            <CardDescription>Messages from HR and team leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hrMessages.map((message) => (
                <div key={message.id} className={`p-3 rounded-lg border ${!message.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.from}</span>
                        {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                      </div>
                      <p className="text-sm font-medium">{message.subject}</p>
                      <p className="text-xs text-muted-foreground">{message.preview}</p>
                      <span className="text-xs text-muted-foreground">{message.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Feedback to HR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Daily Update
                </Button>
              </Link>
              <Link href="/dashboard/finance">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Expense Reimbursement
                </Button>
              </Link>
              <Link href="/dashboard/teams">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  View My Department
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Access your resources and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                Personal Drive Folder
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Department Notion Page
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                RYD Resources Hub
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}