"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  FolderKanban, 
  Calendar, 
  Users, 
  FileText, 
  DollarSign,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  BarChart3
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import Link from "next/link"

// Mock data - replace with real API calls
const kpiData = {
  ongoingProjects: 4,
  tasksDueThisWeek: 12,
  activeTeamMembers: 8,
  inactiveMembers: 2,
  pendingReports: 3,
  departmentBudget: 15000000 // UGX
}

const projectProgressData = [
  { project: 'Youth Mental Health', progress: 75, milestones: 8, completed: 6 },
  { project: 'Community Outreach', progress: 60, milestones: 5, completed: 3 },
  { project: 'Refugee Support', progress: 90, milestones: 10, completed: 9 },
  { project: 'Disability Services', progress: 45, milestones: 6, completed: 3 }
]

const weeklyProgressData = [
  { week: 'Week 1', completed: 15, assigned: 20 },
  { week: 'Week 2', completed: 18, assigned: 22 },
  { week: 'Week 3', completed: 12, assigned: 18 },
  { week: 'Week 4', completed: 21, assigned: 25 }
]

const tasksByStatus = {
  todo: 8,
  inProgress: 12,
  done: 23
}

const teamMembers = [
  { id: 1, name: 'Sarah Nakato', role: 'Senior Counselor', status: 'active', tasks: 5, lastUpdate: '2 hours ago' },
  { id: 2, name: 'James Okello', role: 'Community Liaison', status: 'active', tasks: 3, lastUpdate: '4 hours ago' },
  { id: 3, name: 'Grace Namuli', role: 'Youth Coordinator', status: 'active', tasks: 7, lastUpdate: '1 day ago' },
  { id: 4, name: 'Peter Ssali', role: 'Volunteer Coordinator', status: 'inactive', tasks: 2, lastUpdate: '3 days ago' }
]

const upcomingDeadlines = [
  { id: 1, task: 'Youth Program Report', project: 'Youth Mental Health', due: '2 days', urgent: true },
  { id: 2, task: 'Community Meeting Prep', project: 'Community Outreach', due: '4 days', urgent: false },
  { id: 3, task: 'Budget Review', project: 'Department Admin', due: '1 week', urgent: false },
  { id: 4, task: 'Volunteer Training', project: 'Capacity Building', due: '5 days', urgent: true }
]

const dailySubmissions = [
  { id: 1, user: 'Sarah Nakato', submission: 'Completed 3 counseling sessions, updated client files', time: '1 hour ago' },
  { id: 2, user: 'Grace Namuli', submission: 'Youth workshop planning meeting - 15 participants confirmed', time: '3 hours ago' },
  { id: 3, user: 'James Okello', submission: 'Community visit completed, 2 new referrals received', time: '5 hours ago' }
]

export function TeamLeadDashboard() {
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team Lead Dashboard</h1>
          <p className="text-muted-foreground">Monitor team progress and manage department operations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
          <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
            <Plus className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-[#0B874E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.ongoingProjects}</div>
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
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activeTeamMembers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{kpiData.inactiveMembers} inactive</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Department Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpiData.departmentBudget)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">78% remaining</span> this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Task Tracker - Kanban Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Task Tracker
          </CardTitle>
          <CardDescription>Current task distribution across your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">To Do</h4>
                <Badge variant="secondary">{tasksByStatus.todo}</Badge>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-gray-400 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">In Progress</h4>
                <Badge variant="default" className="bg-[#0B874E]">{tasksByStatus.inProgress}</Badge>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-[#0B874E] rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Done</h4>
                <Badge variant="default" className="bg-green-600">{tasksByStatus.done}</Badge>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-600 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Milestone Progress by Project */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Milestone Progress by Project
            </CardTitle>
            <CardDescription>Current progress across all active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectProgressData.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{project.project}</span>
                    <span className="text-sm text-muted-foreground">
                      {project.completed}/{project.milestones} milestones
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">{project.progress}% complete</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Task Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Task Completion
            </CardTitle>
            <CardDescription>Tasks completed vs assigned over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#0B874E" 
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="assigned" 
                    stroke="#94A3B8" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Status and Alerts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Members Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>Current team status and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{member.name}</span>
                      <Badge 
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className={member.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.tasks} active tasks • Last update: {member.lastUpdate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Tasks and milestones requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    deadline.urgent ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{deadline.task}</p>
                    <p className="text-xs text-muted-foreground">{deadline.project}</p>
                    <p className="text-xs text-muted-foreground">Due in {deadline.due}</p>
                  </div>
                  {deadline.urgent && (
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Team Submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daily Team Submissions
          </CardTitle>
          <CardDescription>Recent updates from your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailySubmissions.map((submission) => (
              <div key={submission.id} className="flex items-start gap-4 p-4 rounded-lg border">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {submission.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{submission.user}</span>
                    <span className="text-xs text-muted-foreground">{submission.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{submission.submission}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions and Resources */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common team management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link href="/dashboard/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Button>
              </Link>
              <Link href="/dashboard/projects">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Department Report
                </Button>
              </Link>
              <Link href="/dashboard/team">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review Team Updates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Department Resources</CardTitle>
            <CardDescription>Quick access to important links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                Department Drive Folder
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Notion Workspace
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Team Calendar
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}