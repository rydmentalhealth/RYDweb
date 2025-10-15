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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  FileText,
  ThumbsUp,
  MessageSquare
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProjectProgressUpdatesProps {
  project: {
    id: string
    name: string
    progressUpdates?: Array<{
      id: string
      taskActivity: string
      progressPercentage: number
      challenges?: string
      nextPlan?: string
      attachment?: string
      isApproved: boolean
      approvedAt?: string
      comments?: string
      createdAt: string
      user: {
        id: string
        firstName: string
        lastName: string
        avatar?: string
      }
    }>
  }
}

const progressUpdateSchema = z.object({
  taskActivity: z.string().min(1, "Task/Activity is required"),
  progressPercentage: z.number().min(0).max(100, "Progress must be between 0 and 100"),
  challenges: z.string().optional(),
  nextPlan: z.string().optional(),
})

export function ProjectProgressUpdates({ project }: ProjectProgressUpdatesProps) {
  const [isAddingUpdate, setIsAddingUpdate] = useState(false)
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null)

  const form = useForm<z.infer<typeof progressUpdateSchema>>({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      taskActivity: "",
      progressPercentage: 0,
      challenges: "",
      nextPlan: "",
    },
  })

  const handleAddUpdate = async (data: z.infer<typeof progressUpdateSchema>) => {
    try {
      // TODO: Implement API call to create progress update
      console.log('Creating progress update:', data)
      toast.success("Progress update submitted successfully")
      form.reset()
      setIsAddingUpdate(false)
    } catch (error) {
      toast.error("Failed to submit progress update")
      console.error("Error creating progress update:", error)
    }
  }

  const handleApproveUpdate = async (updateId: string) => {
    try {
      // TODO: Implement API call to approve progress update
      console.log('Approving progress update:', updateId)
      toast.success("Progress update approved")
    } catch (error) {
      toast.error("Failed to approve progress update")
      console.error("Error approving progress update:", error)
    }
  }

  const handleCommentUpdate = async (updateId: string, comment: string) => {
    try {
      // TODO: Implement API call to add comment to progress update
      console.log('Adding comment to progress update:', updateId, comment)
      toast.success("Comment added successfully")
    } catch (error) {
      toast.error("Failed to add comment")
      console.error("Error adding comment:", error)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-blue-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Daily Progress Updates</h3>
          <p className="text-sm text-muted-foreground">
            Track daily progress and team updates
          </p>
        </div>
        
        <Dialog open={isAddingUpdate} onOpenChange={setIsAddingUpdate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Submit Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Progress Update</DialogTitle>
              <DialogDescription>
                Submit your daily progress update for this project
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(handleAddUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taskActivity">Task/Activity Completed *</Label>
                <Textarea
                  id="taskActivity"
                  {...form.register("taskActivity")}
                  placeholder="Describe what you accomplished today"
                  rows={3}
                />
                {form.formState.errors.taskActivity && (
                  <p className="text-sm text-red-500">{form.formState.errors.taskActivity.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="progressPercentage">Progress Percentage *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="progressPercentage"
                    type="number"
                    min="0"
                    max="100"
                    {...form.register("progressPercentage", { valueAsNumber: true })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                  <div className="flex-1">
                    <Progress 
                      value={form.watch("progressPercentage") || 0} 
                      className="h-2"
                    />
                  </div>
                </div>
                {form.formState.errors.progressPercentage && (
                  <p className="text-sm text-red-500">{form.formState.errors.progressPercentage.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges Encountered</Label>
                <Textarea
                  id="challenges"
                  {...form.register("challenges")}
                  placeholder="Describe any challenges or obstacles you faced"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nextPlan">Next Day's Plan</Label>
                <Textarea
                  id="nextPlan"
                  {...form.register("nextPlan")}
                  placeholder="What do you plan to work on next?"
                  rows={2}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddingUpdate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Update</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Updates List */}
      <div className="space-y-4">
        {project.progressUpdates && project.progressUpdates.length > 0 ? (
          project.progressUpdates.map((update) => (
            <Card key={update.id} className={`${
              update.isApproved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
            }`}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Update Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={update.user.avatar} alt={`${update.user.firstName} ${update.user.lastName}`} />
                        <AvatarFallback>
                          {update.user.firstName?.[0]}{update.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{update.user.firstName} {update.user.lastName}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(update.createdAt), 'MMM d, yyyy at h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {update.isApproved ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Update Content */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Task/Activity Completed</h4>
                      <p className="text-sm">{update.taskActivity}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Progress</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className={getProgressColor(update.progressPercentage)}>
                              {update.progressPercentage}%
                            </span>
                          </div>
                          <Progress 
                            value={update.progressPercentage} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>

                    {update.challenges && (
                      <div>
                        <h4 className="font-medium mb-2">Challenges</h4>
                        <p className="text-sm">{update.challenges}</p>
                      </div>
                    )}

                    {update.nextPlan && (
                      <div>
                        <h4 className="font-medium mb-2">Next Day's Plan</h4>
                        <p className="text-sm">{update.nextPlan}</p>
                      </div>
                    )}

                    {update.attachment && (
                      <div>
                        <h4 className="font-medium mb-2">Attachment</h4>
                        <Button variant="outline" size="sm" asChild>
                          <a href={update.attachment} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            View Attachment
                          </a>
                        </Button>
                      </div>
                    )}

                    {update.comments && (
                      <div>
                        <h4 className="font-medium mb-2">Project Lead Comments</h4>
                        <p className="text-sm bg-muted p-3 rounded">{update.comments}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!update.isApproved && (
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUpdate(update.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUpdate(update.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No progress updates yet</p>
                <p className="text-sm text-muted-foreground">Submit your first progress update to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Summary */}
      {project.progressUpdates && project.progressUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
            <CardDescription>
              AI-generated summary of this week's progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                Team achieved 80% of planned tasks this week. Outreach materials are pending review, 
                and the therapy program implementation is on track. Main challenges include resource 
                allocation and timeline adjustments. Next week's focus should be on completing 
                pending reviews and preparing for the next phase.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}