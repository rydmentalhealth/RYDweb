'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  CalendarDays,
  Users,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Event {
  id: string
  title: string
  description?: string
  date: string
  type: string
  author: {
    name: string
    role: string
  }
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

export function EventsManagement() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    type: 'GENERAL',
  })
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    priority: 'NORMAL',
  })

  // Check if user has permission to manage events
  const canManageEvents = session?.user?.role && [
    'SUPER_ADMIN', 'CEO', 'CFO', 'ADMIN', 'DIRECTOR', 'HR_OFFICER'
  ].includes(session.user.role)

  useEffect(() => {
    if (canManageEvents) {
      fetchData()
    }
  }, [canManageEvents])

  const fetchData = async () => {
    try {
      const [eventsRes, announcementsRes] = await Promise.all([
        fetch('/api/events?limit=50'),
        fetch('/api/communication/announcements?limit=50')
      ])

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEvents(eventsData.events || [])
      }

      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json()
        setAnnouncements(announcementsData.announcements || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load events and announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      toast.success('Event created successfully! 📅')
      setIsEventDialogOpen(false)
      setEventForm({
        title: '',
        description: '',
        date: '',
        type: 'GENERAL',
      })
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/communication/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcementForm,
          publishNow: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create announcement')
      }

      toast.success('Announcement created successfully! 📢')
      setIsAnnouncementDialogOpen(false)
      setAnnouncementForm({
        title: '',
        content: '',
        type: 'GENERAL',
        priority: 'NORMAL',
      })
      fetchData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create announcement')
    } finally {
      setSubmitting(false)
    }
  }

  if (!canManageEvents) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              You don't have permission to manage events and announcements.
            </p>
            <p className="text-sm text-muted-foreground">
              Only HR, Admin, and Super Admin roles can access this feature.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events & Announcements</h1>
          <p className="text-muted-foreground">Manage RYD events and announcements for all staff</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarDays className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new RYD event that will be visible to all staff members.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEventSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    placeholder="e.g. Team Building Workshop"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    placeholder="Event details and information..."
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select value={eventForm.type} onValueChange={(value) => setEventForm({ ...eventForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="TRAINING">Training</SelectItem>
                        <SelectItem value="MEETING">Meeting</SelectItem>
                        <SelectItem value="WORKSHOP">Workshop</SelectItem>
                        <SelectItem value="SOCIAL">Social Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEventDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>
                  Add a new announcement that will be visible to all staff members.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="announcement-title">Announcement Title</Label>
                  <Input
                    id="announcement-title"
                    placeholder="e.g. New Policy Update"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="announcement-content">Content</Label>
                  <Textarea
                    id="announcement-content"
                    placeholder="Announcement content and details..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-type">Type</Label>
                    <Select value={announcementForm.type} onValueChange={(value) => setAnnouncementForm({ ...announcementForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GENERAL">General</SelectItem>
                        <SelectItem value="POLICY">Policy</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                        <SelectItem value="TRAINING">Training</SelectItem>
                        <SelectItem value="DEADLINE">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="announcement-priority">Priority</Label>
                    <Select value={announcementForm.priority} onValueChange={(value) => setAnnouncementForm({ ...announcementForm, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAnnouncementDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Announcement'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Events and Announcements Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Manage RYD events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events created yet</p>
                <p className="text-sm">Create your first event to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {event.author.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {events.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    And {events.length - 5} more events...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Manage organization-wide announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No announcements created yet</p>
                <p className="text-sm">Create your first announcement to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 5).map((announcement) => (
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
                          <Badge variant="outline" className="text-xs">{announcement.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            By {announcement.author.name} • {format(new Date(announcement.createdAt), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    And {announcements.length - 5} more announcements...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}