"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Target,
  User
} from "lucide-react"
import { format, parseISO, isPast, isFuture, differenceInDays } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

interface ProjectMilestonesProps {
  project: {
    id: string
    name: string
    milestones?: Array<{
      id: string
      title: string
      description?: string
      dueDate: string
      progress: number
      status: string
      responsibleUser?: {
        id: string
        firstName: string
        lastName: string
      }
      subTasks?: Array<{
        id: string
        title: string
        isCompleted: boolean
      }>
    }>
  }
}

const milestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  responsibleUserId: z.string().optional(),
})

export function ProjectMilestones({ project }: ProjectMilestonesProps) {
  const [isAddingMilestone, setIsAddingMilestone] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)

  const form = useForm<z.infer<typeof milestoneSchema>>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      responsibleUserId: "",
    },
  })

  const getMilestoneStatusColor = (status: string, dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status !== 'COMPLETED'
    
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200'
    
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMilestoneStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status !== 'COMPLETED'
    
    if (isOverdue) return <AlertCircle className="h-4 w-4" />
    
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string, dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status !== 'COMPLETED'
    
    if (isOverdue) return 'Overdue'
    
    switch (status) {
      case 'COMPLETED':
        return 'Completed'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'DELAYED':
        return 'Delayed'
      case 'PLANNED':
        return 'Planned'
      default:
        return 'Unknown'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date())
    if (days < 0) return `Overdue by ${Math.abs(days)} days`
    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'
    return `Due in ${days} days`
  }

  const handleAddMilestone = async (data: z.infer<typeof milestoneSchema>) => {
    try {
      // TODO: Implement API call to create milestone
      console.log('Creating milestone:', data)
      toast.success("Milestone created successfully")
      form.reset()
      setIsAddingMilestone(false)
    } catch (error) {
      toast.error("Failed to create milestone")
      console.error("Error creating milestone:", error)
    }
  }

  const handleUpdateMilestone = async (milestoneId: string, data: z.infer<typeof milestoneSchema>) => {
    try {
      // TODO: Implement API call to update milestone
      console.log('Updating milestone:', milestoneId, data)
      toast.success("Milestone updated successfully")
      setEditingMilestone(null)
    } catch (error) {
      toast.error("Failed to update milestone")
      console.error("Error updating milestone:", error)
    }
  }

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm("Are you sure you want to delete this milestone?")) return
    
    try {
      // TODO: Implement API call to delete milestone
      console.log('Deleting milestone:', milestoneId)
      toast.success("Milestone deleted successfully")
    } catch (error) {
      toast.error("Failed to delete milestone")
      console.error("Error deleting milestone:", error)
    }
  }

  const handleStatusChange = async (milestoneId: string, newStatus: string) => {
    try {
      // TODO: Implement API call to update milestone status
      console.log('Updating milestone status:', milestoneId, newStatus)
      toast.success("Milestone status updated")
    } catch (error) {
      toast.error("Failed to update milestone status")
      console.error("Error updating milestone status:", error)
    }
  }

  const handleProgressUpdate = async (milestoneId: string, progress: number) => {
    try {
      // TODO: Implement API call to update milestone progress
      console.log('Updating milestone progress:', milestoneId, progress)
      toast.success("Milestone progress updated")
    } catch (error) {
      toast.error("Failed to update milestone progress")
      console.error("Error updating milestone progress:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Milestones</h3>
          <p className="text-sm text-muted-foreground">
            Track project milestones and their progress
          </p>
        </div>
        
        <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
              <DialogDescription>
                Create a new milestone for this project
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(handleAddMilestone)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter milestone title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Enter milestone description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...form.register("dueDate")}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsibleUserId">Responsible User</Label>
                <Select onValueChange={(value) => form.setValue("responsibleUserId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select responsible user" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Add team members from project */}
                    <SelectItem value="user1">John Doe</SelectItem>
                    <SelectItem value="user2">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingMilestone(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Milestone</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {project.milestones && project.milestones.length > 0 ? (
          project.milestones.map((milestone) => {
            const isOverdue = isPast(parseISO(milestone.dueDate)) && milestone.status !== 'COMPLETED'
            const isUpcoming = isFuture(parseISO(milestone.dueDate))
            
            return (
              <Card key={milestone.id} className={`${getMilestoneStatusColor(milestone.status, milestone.dueDate)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getMilestoneStatusIcon(milestone.status, milestone.dueDate)}
                      <div className="space-y-2">
                        <h4 className="font-medium">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm opacity-75">{milestone.description}</p>
                        )}
                        {milestone.responsibleUser && (
                          <div className="flex items-center gap-1 text-sm opacity-75">
                            <User className="h-3 w-3" />
                            <span>{milestone.responsibleUser.firstName} {milestone.responsibleUser.lastName}</span>
                          </div>
                        )}
                        
                        {/* Sub-tasks */}
                        {milestone.subTasks && milestone.subTasks.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium opacity-75">Sub-tasks:</p>
                            {milestone.subTasks.map((subTask) => (
                              <div key={subTask.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={subTask.isCompleted}
                                  onChange={() => {
                                    // TODO: Implement sub-task toggle
                                    console.log('Toggle sub-task:', subTask.id)
                                  }}
                                />
                                <span className={subTask.isCompleted ? 'line-through opacity-50' : ''}>
                                  {subTask.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">
                          {format(parseISO(milestone.dueDate), 'MMM d, yyyy')}
                        </p>
                        <p className={`text-xs ${
                          isOverdue ? 'text-red-600' : 
                          isUpcoming ? 'text-blue-600' : 
                          'text-muted-foreground'
                        }`}>
                          {getDaysUntilDue(milestone.dueDate)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(milestone.status, milestone.dueDate)}
                        </Badge>
                      </div>
                      
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMilestone(milestone.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No milestones created yet</p>
                <p className="text-sm text-muted-foreground">Add milestones to track project progress</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}