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
  Plus,
  Send,
  Save,
  Loader2,
  Settings
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Link from "next/link"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

// Interfaces for type safety
interface VolunteerStats {
  activeAssignments: number
  hoursLoggedThisWeek: number
  pendingTasks: number
  teamLeadFeedback: string
  totalTasksCompleted: number
  totalHoursServed: number
  communitiesReached: number
  monthsActive: number
  weeklyHours: number
  tasksDueThisWeek: number
}

interface Task {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
  endDate?: string
  project?: {
    name: string
  }
}

interface Event {
  id: string
  title: string
  description?: string
  date: string
  type: string
}

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: string
  createdAt: string
  author: {
    name: string
    role: string
  }
}

export function VolunteerDashboard() {
  const { data: session } = useSession()
  const [isDailyUpdateDialogOpen, setIsDailyUpdateDialogOpen] = useState(false)
  const [submittingUpdate, setSubmittingUpdate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<VolunteerStats>({
    activeAssignments: 0,
    hoursLoggedThisWeek: 0,
    pendingTasks: 0,
    teamLeadFeedback: 'Pending',
    totalTasksCompleted: 0,
    totalHoursServed: 0,
    communitiesReached: 0,
    monthsActive: 0,
    weeklyHours: 0,
    tasksDueThisWeek: 0
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dailyUpdate, setDailyUpdate] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    hoursSpent: 0,
    isApproved: false,
    submittedToHR: false,
    id: undefined as string | undefined
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session?.user?.id])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes, eventsRes, announcementsRes] = await Promise.all([
        fetch('/api/dashboard/volunteer-stats'),
        fetch('/api/tasks?assigned=true&limit=10'),
        fetch('/api/events?upcoming=true&limit=5'),
        fetch('/api/communication/announcements?limit=5')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks || [])
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData.events || [])
      }

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.announcements || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
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

  const handleDailyUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingUpdate(true)

    try {
      const method = dailyUpdate.id ? 'PUT' : 'POST'
      const url = dailyUpdate.id 
        ? `/api/attendance/daily-logs/${dailyUpdate.id}`
        : '/api/attendance/daily-logs'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dailyUpdate.date,
          description: dailyUpdate.description,
          hoursSpent: dailyUpdate.hoursSpent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit daily update')
      }

      const result = await response.json()
      
      setDailyUpdate(prev => ({
        ...prev,
        id: result.id,
        isApproved: result.isApproved,
        submittedToHR: false
      }))

      toast.success('Daily update saved successfully! 📝')
      setIsDailyUpdateDialogOpen(false)
    } catch (error) {
      toast.error('Failed to submit daily update')
    } finally {
      setSubmittingUpdate(false)
    }
  }

  const handleSubmitToHR = async () => {
    if (!dailyUpdate.id) {
      toast.error('Please save your daily update first')
      return
    }

    setSubmittingUpdate(true)

    try {
      const response = await fetch(`/api/attendance/daily-logs/${dailyUpdate.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit to HR')
      }

      setDailyUpdate(prev => ({
        ...prev,
        submittedToHR: true,
      }))

      toast.success('Daily update submitted to HR successfully! 🚀')
      setIsDailyUpdateDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit to HR')
    } finally {
      setSubmittingUpdate(false)
    }
  }

  const handleTaskComplete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to complete task')
      }

      const result = await response.json()
      toast.success(result.message || 'Task marked as completed! ✅')
      fetchDashboardData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete task')
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

  const weeklyHoursData = [
    { week: 'Week 1', hours: Math.max(0, stats.weeklyHours - 6), target: 10 },
    { week: 'Week 2', hours: Math.max(0, stats.weeklyHours - 4), target: 10 },
    { week: 'Week 3', hours: Math.max(0, stats.weeklyHours - 2), target: 10 },
    { week: 'Week 4', hours: stats.weeklyHours, target: 10 }
  ]

  const tasksByStatus = [
    { name: 'To Do', value: Math.max(0, stats.pendingTasks - tasks.filter(t => t.status === 'IN_PROGRESS').length), color: '#94A3B8' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#0B874E' },
    { name: 'Done', value: stats.totalTasksCompleted, color: '#16A34A' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
          <Dialog open={isDailyUpdateDialogOpen} onOpenChange={setIsDailyUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Daily Update
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Daily Update</DialogTitle>
                <DialogDescription>
                  Log your volunteer activities and hours for today. Once submitted to HR, it cannot be edited.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDailyUpdateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={dailyUpdate.date}
                    onChange={(e) => setDailyUpdate({ ...dailyUpdate, date: e.target.value })}
                    disabled={dailyUpdate.submittedToHR}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Activities & Achievements</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your volunteer activities today, tasks completed, people helped, and impact made..."
                    value={dailyUpdate.description}
                    onChange={(e) => setDailyUpdate({ ...dailyUpdate, description: e.target.value })}
                    disabled={dailyUpdate.submittedToHR}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Volunteered</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 4"
                    value={dailyUpdate.hoursSpent || ''}
                    onChange={(e) => setDailyUpdate({ ...dailyUpdate, hoursSpent: parseFloat(e.target.value) || 0 })}
                    disabled={dailyUpdate.submittedToHR}
                  />
                </div>
                {dailyUpdate.submittedToHR && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This update has been submitted to HR and is now read-only.
                      {dailyUpdate.isApproved && ' It has been approved.'}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDailyUpdateDialogOpen(false)}
                  >
                    {dailyUpdate.submittedToHR ? 'Close' : 'Cancel'}
                  </Button>
                  {!dailyUpdate.submittedToHR && (
                    <>
                      <Button type="submit" disabled={submittingUpdate} variant="outline">
                        {submittingUpdate ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {dailyUpdate.id ? 'Save Changes' : 'Save Draft'}
                          </>
                        )}
                      </Button>
                      {dailyUpdate.id && (
                        <Button 
                          type="button" 
                          onClick={handleSubmitToHR}
                          disabled={submittingUpdate}
                          className="bg-[#0B874E] hover:bg-[#0B874E]/90"
                        >
                          {submittingUpdate ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit to HR
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
            <Phone className="h-4 w-4 mr-2" />
            Contact HR
          </Button>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
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
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            <p className="text-xs text-muted-foreground">Current projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursLoggedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              {stats.hoursLoggedThisWeek > 0 ? 'Great work!' : 'Log your hours'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Lead Feedback</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamLeadFeedback}</div>
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
              <div className="text-3xl font-bold text-[#0B874E]">{stats.totalTasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{stats.totalHoursServed}</div>
              <div className="text-sm text-muted-foreground">Hours Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{stats.communitiesReached}</div>
              <div className="text-sm text-muted-foreground">Communities Reached</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{stats.monthsActive}</div>
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
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks assigned</p>
                  <p className="text-sm">Check back later for new volunteer opportunities</p>
                </div>
              ) : (
                tasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                      <Badge className={getStatusColor(task.status.toLowerCase())}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{task.project?.name || 'General'}</Badge>
                      {task.endDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {format(new Date(task.endDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {task.status !== 'COMPLETED' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => handleTaskComplete(task.id)}
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                ))
              )}
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
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No announcements currently</p>
                  <p className="text-sm">Stay tuned for updates from management!</p>
                  <p className="text-xs mt-2 text-muted-foreground/70">
                    Only HR, Admin, Team Leads, and Super Admin can create announcements
                  </p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${getPriorityColor(announcement.priority)}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(announcement.createdAt), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        By {announcement.author.name} • {announcement.author.role}
                      </span>
                    </div>
                  </div>
                ))
              )}
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
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events currently scheduled</p>
                  <p className="text-sm">Stay tuned for updates from HR and management!</p>
                  <p className="text-xs mt-2 text-muted-foreground/70">
                    Only HR, Admin, and Super Admin can create events
                  </p>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="w-2 h-2 bg-[#0B874E] rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                  </div>
                ))
              )}
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
            <Button 
              className="w-full bg-[#0B874E] hover:bg-[#0B874E]/90"
              onClick={() => setIsDailyUpdateDialogOpen(true)}
            >
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
              <Link href="/dashboard/chat">
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Chat</CardTitle>
            <CardDescription>Connect with your team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                try {
                  // Get or create department channel
                  const response = await fetch('/api/communication/channels/department')
                  if (response.ok) {
                    const data = await response.json()
                    // Redirect to communication page with the department channel selected
                    window.location.href = `/dashboard/communication?channel=${data.channel.id}&tab=chat`
                  } else {
                    const error = await response.json()
                    toast.error(error.error || 'Failed to access department chat')
                  }
                } catch (error) {
                  toast.error('Failed to access department chat')
                }
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              View Department Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}