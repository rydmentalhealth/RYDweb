'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface DailyLog {
  id: string
  date: string
  description: string
  hoursSpent?: number
  category?: string
  isApproved: boolean
  approvedBy?: {
    name: string
  }
  createdAt: string
}

export function DailyTaskLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    hoursSpent: '',
    category: '',
  })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/attendance/daily-logs?limit=20')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      toast.error('Failed to load task logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/attendance/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hoursSpent: formData.hoursSpent ? parseFloat(formData.hoursSpent) : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create log')
      }

      toast.success('Task log created successfully! 📝')
      setIsDialogOpen(false)
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        hoursSpent: '',
        category: '',
      })
      fetchLogs()
    } catch (error) {
      toast.error('Failed to create task log')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return

    try {
      const response = await fetch(`/api/attendance/daily-logs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete log')
      }

      toast.success('Task log deleted')
      fetchLogs()
    } catch (error) {
      toast.error('Failed to delete task log')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Task Logs</CardTitle>
              <CardDescription>
                Record what you worked on each day for better tracking and reporting
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Log
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create Daily Task Log</DialogTitle>
                  <DialogDescription>
                    Document your daily work activities and achievements
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">What did you work on?</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the tasks you completed, challenges faced, and outcomes achieved..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hoursSpent">Hours Spent (Optional)</Label>
                      <Input
                        id="hoursSpent"
                        type="number"
                        step="0.5"
                        placeholder="e.g. 4.5"
                        value={formData.hoursSpent}
                        onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Input
                        id="category"
                        placeholder="e.g. Development"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
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
                        'Create Log'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No task logs yet</p>
              <p className="text-sm">Start documenting your daily work activities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(log.date), 'MMM d, yyyy')}
                          </Badge>
                          {log.hoursSpent && (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {log.hoursSpent}h
                            </Badge>
                          )}
                          {log.category && (
                            <Badge variant="secondary">{log.category}</Badge>
                          )}
                          {log.isApproved ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{log.description}</p>
                        {log.approvedBy && (
                          <p className="text-xs text-muted-foreground">
                            Approved by {log.approvedBy.name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(log.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
