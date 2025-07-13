"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { formatDistanceToNow, format } from "date-fns"
import { useTask, useTaskComments, useAddTaskComment } from "@/lib/hooks/use-tasks"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, MapPinIcon, MessageSquareIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"

interface ViewTaskSheetProps {
  taskId: string
  trigger: React.ReactNode
}

// Format functions for consistent display
function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'URGENT': 'Urgent'
  }
  return priorityMap[priority] || priority
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'NOT_STARTED': 'Not Started',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'OVERDUE': 'Overdue'
  }
  return statusMap[status] || status
}

function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'LOW':
      return 'bg-green-100 text-green-800'
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800'
    case 'HIGH':
      return 'bg-amber-100 text-amber-800'
    case 'URGENT':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'NOT_STARTED':
      return 'bg-gray-100 text-gray-800'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'OVERDUE':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ViewTaskSheet({ taskId, trigger }: ViewTaskSheetProps) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState("")
  
  // Fetch task data with React Query
  const { 
    data: task, 
    isLoading, 
    isError 
  } = useTask(taskId)
  
  // Fetch task comments
  const { 
    data: comments = [], 
    isLoading: isLoadingComments, 
    isError: isErrorComments 
  } = useTaskComments(taskId)
  
  // Add comment mutation
  const addComment = useAddTaskComment(taskId)
  
  const handleAddComment = async () => {
    if (!comment.trim()) return
    
    try {
      await addComment.mutateAsync(comment.trim())
      setComment("")
      toast.success("Comment added successfully")
    } catch (error) {
      toast.error("Failed to add comment")
      console.error("Error adding comment:", error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-4 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-4">
            <p className="text-red-500">Failed to load task details</p>
          </div>
        ) : task ? (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{task.title}</SheetTitle>
              <div className="flex gap-2 items-center mt-2">
                <Badge className={getStatusClass(task.status)}>
                  {formatStatus(task.status)}
                </Badge>
                <Badge className={getPriorityClass(task.priority)} variant="outline">
                  {formatPriority(task.priority)}
                </Badge>
              </div>
              <SheetDescription className="mt-2">
                Created {task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : "recently"}
                {task.createdBy && ` by ${task.createdBy.firstName} ${task.createdBy.lastName}`}
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid gap-4 py-4">
              {/* Task Description */}
              {task.description && (
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              )}
              
              {/* Task Details */}
              <div className="grid grid-cols-2 gap-4">
                {/* Assignee */}
                <div>
                  <h3 className="font-medium mb-2">Assignees</h3>
                  {task.assignees && task.assignees.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {task.assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={assignee.avatar || ""} 
                              alt={`${assignee.firstName} ${assignee.lastName}`} 
                            />
                            <AvatarFallback>
                              {assignee.firstName.charAt(0)}{assignee.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {assignee.firstName} {assignee.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </div>
                
                {/* Date Range */}
                <div>
                  <h3 className="font-medium mb-2">Date Range</h3>
                  {task.startDate || task.endDate ? (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {task.startDate && format(new Date(task.startDate), "LLL dd, y")}
                        {task.startDate && task.endDate && " - "}
                        {task.endDate && format(new Date(task.endDate), "LLL dd, y")}
                        {task.startDate && new Date(task.startDate) < new Date() && task.status !== 'COMPLETED' && (
                          <span className="text-red-500 ml-1">(Overdue)</span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No date range set</span>
                  )}
                </div>
              </div>
              
              {/* Location if available */}
              {task.location && (
                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{task.location}</span>
                  </div>
                </div>
              )}
              
              {/* Project if available */}
              {task.project && (
                <div>
                  <h3 className="font-medium mb-2">Project</h3>
                  <span className="text-sm">{task.project.name}</span>
                </div>
              )}
              
              {/* Completed Date if available */}
              {task.completedAt && (
                <div>
                  <h3 className="font-medium mb-2">Completed</h3>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-green-600">
                      {formatDistanceToNow(new Date(task.completedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Comments Section */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquareIcon className="h-5 w-5" />
                  <h3 className="font-medium">Comments</h3>
                </div>
                
                {/* Comment input */}
                <div className="flex gap-2 mb-4">
                  <Textarea 
                    placeholder="Add a comment..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button 
                    size="icon" 
                    onClick={handleAddComment} 
                    disabled={!comment.trim() || addComment.isPending}
                    className="self-end"
                  >
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Comments list */}
                {isLoadingComments ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : isErrorComments ? (
                  <p className="text-sm text-red-500">Failed to load comments</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-3 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            {comment.author && (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage 
                                    src={comment.author.avatar || ""} 
                                    alt={`${comment.author.firstName} ${comment.author.lastName}`} 
                                  />
                                  <AvatarFallback>
                                    {comment.author.firstName.charAt(0)}{comment.author.lastName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">
                                  {comment.author.firstName} {comment.author.lastName}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <SheetFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </SheetFooter>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Task not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 