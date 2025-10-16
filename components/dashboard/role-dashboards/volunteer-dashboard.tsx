"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  Calendar, 
  CheckCircle, 
  Clock,
  MessageSquare,
  FileText,
  ExternalLink,
  Users,
  Video,
  Phone,
  Award,
  TrendingUp,
  Target,
  Plus
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Link from "next/link"

// Mock data - replace with real API calls
const kpiData = {
  activeAssignments: 2,
  hoursLoggedThisWeek: 12,
  pendingTasks: 4,
  teamLeadFeedback: 'Excellent'
}

const weeklyHoursData = [
  { week: 'Week 1', hours: 8, target: 10 },
  { week: 'Week 2', hours: 12, target: 10 },
  { week: 'Week 3', hours: 6, target: 10 },
  { week: 'Week 4', hours: 14, target: 10 }
]

const tasksByStatus = [
  { name: 'To Do', value: 4, color: '#94A3B8' },
  { name: 'In Progress', value: 2, color: '#0B874E' },
  { name: 'Done', value: 8, color: '#16A34A' }
]

const myTasks = [
  {
    id: 1,
    title: 'Assist with youth group session',
    assignment: 'Youth Programs',
    status: 'todo',
    due: 'Tomorrow',
    description: 'Help facilitate discussion and activities for 15-20 youth participants'
  },
  {
    id: 2,
    title: 'Update community contact database',
    assignment: 'Community Outreach',
    status: 'in_progress',
    due: '3 days',
    description: 'Add new contact information from recent outreach events'
  },
  {
    id: 3,
    title: 'Prepare welcome materials for new volunteers',
    assignment: 'Volunteer Coordination',
    status: 'todo',
    due: '1 week',
    description: 'Create welcome packets and orientation materials'
  }
]

const announcements = [
  {
    id: 1,
    title: 'Monthly Volunteer Appreciation Event',
    content: 'Join us this Friday at 6 PM for our monthly appreciation gathering. Food and refreshments will be provided!',
    date: '2 days ago',
    priority: 'high'
  },
  {
    id: 2,
    title: 'New Mental Health Training Available',
    content: 'We\'re offering a free mental health first aid training next month. Limited spots available - register early!',
    date: '1 week ago',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'RYD Community Outreach Success',
    content: 'Thanks to all volunteers who participated in last week\'s community event. We reached over 200 community members!',
    date: '2 weeks ago',
    priority: 'low'
  }
]

const impactStats = {
  totalTasksCompleted: 47,
  totalHoursServed: 156,
  communitiesReached: 8,
  monthsActive: 6
}

const upcomingEvents = [
  {
    id: 1,
    title: 'Team Building Workshop',
    date: 'This Friday, 2:00 PM',
    location: 'RYD Main Office',
    type: 'workshop'
  },
  {
    id: 2,
    title: 'Community Health Fair',
    date: 'Next Monday, 9:00 AM',
    location: 'Nakawa Community Center',
    type: 'outreach'
  },
  {
    id: 3,
    title: 'Monthly Volunteer Meeting',
    date: 'Next Wednesday, 6:00 PM',
    location: 'Virtual (Zoom)',
    type: 'meeting'
  }
]

export function VolunteerDashboard() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white'
      case 'in_progress': return 'bg-[#0B874E] text-white'
      case 'todo': return 'bg-gray-200 text-gray-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome, Volunteer!</h1>
          <p className="text-muted-foreground">Stay connected, informed, and make a meaningful impact with RYD</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Submit Update
          </Button>
          <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
            <Phone className="h-4 w-4 mr-2" />
            Contact HR
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#0B874E]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.activeAssignments}</div>
            <p className="text-xs text-muted-foreground">Current projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.hoursLoggedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Lead Feedback</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.teamLeadFeedback}</div>
            <p className="text-xs text-muted-foreground">Latest rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Impact Summary */}
      <Card className="border-2 border-[#0B874E]/20 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#0B874E]" />
            Your Impact at RYD
          </CardTitle>
          <CardDescription>See the difference you're making in our community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{impactStats.totalTasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{impactStats.totalHoursServed}</div>
              <div className="text-sm text-muted-foreground">Hours Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{impactStats.communitiesReached}</div>
              <div className="text-sm text-muted-foreground">Communities Reached</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{impactStats.monthsActive}</div>
              <div className="text-sm text-muted-foreground">Months Active</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border">
            <p className="text-sm text-center text-muted-foreground">
              🌟 Thank you for your dedication! Your contributions have directly helped improve mental health services 
              for refugees, youth, and persons with disabilities in our community.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Task Board and Weekly Hours */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Simple Task Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              My Task Board
            </CardTitle>
            <CardDescription>Your current assignments and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Task Status Overview */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{tasksByStatus[0].value}</div>
                  <div className="text-sm text-muted-foreground">To Do</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#0B874E]">{tasksByStatus[1].value}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{tasksByStatus[2].value}</div>
                  <div className="text-sm text-muted-foreground">Done</div>
                </div>
              </div>

              {/* Current Tasks */}
              {myTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{task.assignment}</Badge>
                    <span className="text-xs text-muted-foreground">Due: {task.due}</span>
                  </div>
                  {task.status !== 'completed' && (
                    <Button size="sm" variant="outline" className="w-full mt-2">
                      Mark as Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Hours Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Hours Tracking
            </CardTitle>
            <CardDescription>Your volunteer hours vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#0B874E" />
                  <Bar dataKey="target" fill="#94A3B8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Green: Actual hours • Gray: Target hours (10/week)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements and Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Announcements Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              RYD Announcements
            </CardTitle>
            <CardDescription>Latest news and updates from the team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(announcement.priority)}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <span className="text-xs text-muted-foreground">{announcement.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming RYD Events
            </CardTitle>
            <CardDescription>Don't miss these important events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="w-2 h-2 bg-[#0B874E] rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources and Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Volunteer Resources
          </CardTitle>
          <CardDescription>Quick access to guides, policies, and shared files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-between h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Volunteer Handbook</div>
                <div className="text-xs text-muted-foreground">Guidelines & policies</div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="justify-between h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Training Materials</div>
                <div className="text-xs text-muted-foreground">Skills & development</div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="justify-between h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Shared Drive</div>
                <div className="text-xs text-muted-foreground">Documents & files</div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="justify-between h-auto p-4">
              <div className="text-left">
                <div className="font-medium">Mental Health Resources</div>
                <div className="text-xs text-muted-foreground">Self-care & support</div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Daily Update</CardTitle>
            <CardDescription>Log your activities and hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-[#0B874E] hover:bg-[#0B874E]/90">
              <Plus className="h-4 w-4 mr-2" />
              Submit Daily Update
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get Support</CardTitle>
            <CardDescription>Contact HR or your team lead</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Contact HR
              </Button>
              <Button variant="outline" className="w-full">
                <Video className="h-4 w-4 mr-2" />
                Join RYD Meeting
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Chat</CardTitle>
            <CardDescription>Connect with your team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              View Department Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}