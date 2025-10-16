"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Target,
  Users,
  CalendarDays,
  BarChart3,
  Award,
  AlertTriangle,
  Loader2,
  Edit,
  Save,
  Eye,
  Settings
} from "lucide-react"
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"

// Interfaces for type safety
interface DashboardStats {
  assignedProjects: number
  tasksDueThisWeek: number
  completedTasks: number
  attendanceRate: number
  recentStipends: number
  weeklyHours: number
  communitiesReached: number
  pendingTasks: number
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

interface DailyUpdate {
  id?: string
  date: string
  description: string
  hoursSpent?: number
  isApproved: boolean
  approvedAt?: string
  submittedToHR: boolean
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


export function StaffDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    assignedProjects: 0,
    tasksDueThisWeek: 0,
    completedTasks: 0,
    attendanceRate: 0,
    recentStipends: 0,
    weeklyHours: 0,
    communitiesReached: 0,
    pendingTasks: 0
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [dailyUpdate, setDailyUpdate] = useState<DailyUpdate>({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    hoursSpent: 0,
    isApproved: false,
    submittedToHR: false
  })
  const [events, setEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingUpdate, setSubmittingUpdate] = useState(false)
  const [isEditingUpdate, setIsEditingUpdate] = useState(false)
  const [isDailyUpdateDialogOpen, setIsDailyUpdateDialogOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session?.user?.id])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tasksRes, eventsRes, announcementsRes, dailyUpdateRes] = await Promise.all([
        fetch('/api/dashboard/staff-stats'),
        fetch('/api/tasks?assigned=true&limit=10'),
        fetch('/api/events?upcoming=true&limit=5'),
        fetch('/api/communication/announcements?limit=5'),
        fetch(`/api/attendance/daily-logs?date=${format(new Date(), 'yyyy-MM-dd')}`)
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
      } else {
        console.warn('Failed to fetch events:', eventsRes.status)
        setEvents([])
      }

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.announcements || [])
      } else {
        console.warn('Failed to fetch announcements:', announcementsRes.status)
        setAnnouncements([])
      }

      if (dailyUpdateRes.ok) {
        const dailyUpdateData = await dailyUpdateRes.json()
        if (dailyUpdateData.logs && dailyUpdateData.logs.length > 0) {
          const todayLog = dailyUpdateData.logs[0]
          setDailyUpdate({
            id: todayLog.id,
            date: format(new Date(todayLog.date), 'yyyy-MM-dd'),
            description: todayLog.description,
            hoursSpent: todayLog.hoursSpent || 0,
            isApproved: todayLog.isApproved,
            approvedAt: todayLog.approvedAt,
            submittedToHR: todayLog.isApproved || false
          })
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
      case 'COMPLETED': return 'bg-green-600 text-white'
      case 'IN_PROGRESS': return 'bg-[#0B874E] text-white'
      case 'NOT_STARTED': return 'bg-gray-200 text-gray-800'
      case 'OVERDUE': return 'bg-red-600 text-white'
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
      
      // Update local state
      setDailyUpdate(prev => ({
        ...prev,
        id: result.id,
        isApproved: result.isApproved,
        approvedAt: result.approvedAt,
        submittedToHR: false // Not submitted to HR yet, just saved
      }))

      toast.success('Daily update saved successfully! 📝')
      setIsDailyUpdateDialogOpen(false)
      setIsEditingUpdate(false)
      fetchDashboardData()
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

      const result = await response.json()
      
      // Update local state
      setDailyUpdate(prev => ({
        ...prev,
        submittedToHR: true,
        isApproved: result.isApproved,
        approvedAt: result.approvedAt,
      }))

      toast.success('Daily update submitted to HR successfully! 🚀')
      setIsDailyUpdateDialogOpen(false)
      fetchDashboardData()
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">RYD Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name || session?.user?.firstName}! Track your assignments, progress, and contributions to RYD</p>
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
                  Log your activities and hours for today. Once submitted to HR, it cannot be edited.
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
                    placeholder="Describe what you worked on today, tasks completed, challenges faced, and outcomes achieved..."
                    value={dailyUpdate.description}
                    onChange={(e) => setDailyUpdate({ ...dailyUpdate, description: e.target.value })}
                    disabled={dailyUpdate.submittedToHR}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours Worked</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 8"
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
          <Button 
            variant="outline" 
            size="sm"
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
            <MessageSquare className="h-4 w-4 mr-2" />
            Department Chat
          </Button>
          <Link href="/dashboard/finance">
            <Button size="sm" className="bg-[#0B874E] hover:bg-[#0B874E]/90">
              <DollarSign className="h-4 w-4 mr-2" />
              Request Expense
            </Button>
          </Link>
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
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedProjects}</div>
            <p className="text-xs text-muted-foreground">Current projects</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyHours}</div>
            <p className="text-xs text-muted-foreground">From attendance</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Lead Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyUpdate.isApproved ? '✅' : '⏳'}</div>
            <p className="text-xs text-muted-foreground">{dailyUpdate.isApproved ? 'Approved' : 'Pending'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Your Impact at RYD */}
      <Card className="border-2 border-[#0B874E]/20 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#0B874E]" />
            Your Impact at RYD
          </CardTitle>
          <CardDescription>See the difference you're making in our community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{stats.completedTasks}</div>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{stats.weeklyHours}</div>
              <p className="text-sm text-muted-foreground">Hours Served</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B874E]">{stats.communitiesReached}</div>
              <p className="text-sm text-muted-foreground">Communities Reached</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Task Board and Weekly Tracking */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* My Task Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              My Task Board
            </CardTitle>
            <CardDescription>Your current assignments and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tasks assigned</p>
                <p className="text-sm">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border">
                    <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.project && (
                            <p className="text-xs text-muted-foreground">{task.project.name}</p>
                          )}
                          {task.endDate && (
                            <p className="text-xs text-muted-foreground">
                              Due: {format(new Date(task.endDate), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          {task.status !== 'COMPLETED' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs"
                              onClick={() => handleTaskComplete(task.id)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && (
                  <Link href="/dashboard/tasks">
                    <Button variant="outline" className="w-full">
                      View All Tasks ({tasks.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Tracking Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Tracking Hours
            </CardTitle>
            <CardDescription>Hours from your attendance check-in/out</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.weeklyHours === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-medium">No attendance records found for this week</p>
                <p className="text-sm text-muted-foreground mb-4">
                  To track your working hours, please use the check-in/check-out system daily. 
                  This helps us maintain accurate records and generate your weekly reports.
                </p>
                <div className="space-y-2">
                  <Link href="/dashboard/attendance">
                    <Button variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Go to Attendance System
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Remember to check in when you start work and check out when you finish
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0B874E]">{stats.weeklyHours}h</div>
                  <p className="text-sm text-muted-foreground">This week</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Attendance Rate</span>
                    <span>{stats.attendanceRate}%</span>
                  </div>
                  <Progress value={stats.attendanceRate} className="h-2" />
                </div>
                <Link href="/dashboard/attendance">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Report
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming RYD Events and RYD Announcements */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming RYD Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming RYD Events
            </CardTitle>
            <CardDescription>Don't miss these important events</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-l-4 border-l-[#0B874E]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(event.date), 'MMM d, yyyy')}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RYD Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              RYD Announcements
            </CardTitle>
            <CardDescription>Latest updates from management</CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{announcement.title}</span>
                          <Badge 
                            variant={announcement.priority === 'URGENT' ? 'destructive' : 'secondary'} 
                            className="text-xs"
                          >
                            {announcement.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{announcement.content}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            By {announcement.author.name} • {format(new Date(announcement.createdAt), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/communication">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Announcements
                  </Button>
                </Link>
              </div>
            )}
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setIsDailyUpdateDialogOpen(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Daily Update
              </Button>
              <Link href="/dashboard/finance">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Request Expense Reimbursement
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start"
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
                Department Chat
              </Button>
              <Link href="/dashboard/attendance">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Check In/Out
                </Button>
              </Link>
              <Link href="/dashboard/chat">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
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
              <Link href="/dashboard/tasks">
                <Button variant="outline" className="w-full justify-between">
                  My Tasks
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/teams">
                <Button variant="outline" className="w-full justify-between">
                  My Department
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard/resources">
                <Button variant="outline" className="w-full justify-between">
                  RYD Resources Hub
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}