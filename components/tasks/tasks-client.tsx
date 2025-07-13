"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Clock, 
  Eye, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  UserCheck
} from "lucide-react"
import { formatDistanceToNow, isPast, parseISO, format } from "date-fns"
import { useTasks, useUpdateTask, useDeleteTask } from "@/lib/hooks/use-tasks"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewTaskSheet } from "@/components/tasks/view-task-sheet"
import { EditTaskSheet } from "@/components/tasks/edit-task-sheet"
import { AddTaskSheet } from "@/components/tasks/add-task-sheet"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { useSession } from "next-auth/react"

// Helper functions for formatting
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

// Helper functions for styling
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

function getStatusIcon(status: string) {
  switch (status) {
    case 'NOT_STARTED':
      return <Clock className="h-3 w-3 mr-1" />
    case 'IN_PROGRESS':
      return <Loader2 className="h-3 w-3 mr-1" />
    case 'COMPLETED':
      return <CheckCircle2 className="h-3 w-3 mr-1" />
    case 'OVERDUE':
      return <AlertCircle className="h-3 w-3 mr-1" />
    default:
      return <Clock className="h-3 w-3 mr-1" />
  }
}

export function TasksClient() {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const { data: session } = useSession()
  const user = session?.user
  const permissions = usePermissions()
  
  // Debug logging for SUPER_ADMIN
  if (user?.role === 'SUPER_ADMIN') {
    console.log("[Tasks Client] SUPER_ADMIN Debug:", {
      userEmail: user.email,
      userRole: user.role,
      userStatus: user.status,
      canViewTasks: permissions.canViewTasks,
      canCreateTasks: permissions.canCreateTasks,
      sessionData: session
    });
  }
  
  // Fetch tasks with React Query
  const { 
    data: tasks = [], 
    isLoading, 
    isError,
    error,
    refetch 
  } = useTasks()
  
  // Handle status changes
  const { mutate: updateTask } = useUpdateTask(tasks[0]?.id || "")
  
  // Handle task deletion
  const { mutate: deleteTask } = useDeleteTask()
  
  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask(
      { status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Task marked as ${newStatus.toLowerCase().replace('_', ' ')}`)
          refetch()
        },
        onError: (error: any) => {
          toast.error(`Failed to update task: ${error.message}`)
    }
  }
    )
  }
  
  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId, {
        onSuccess: () => {
          toast.success('Task deleted successfully')
          refetch()
        },
        onError: (error: any) => {
          toast.error(`Failed to delete task: ${error.message}`)
        }
      })
    }
  }
  
  // Handle API errors more gracefully
  if (error) {
    console.error("[Tasks Client] API Error:", error);
    
    // Check if this is a pending user error
    const errorMessage = (error as any)?.message || String(error) || "Unknown error";
    if (errorMessage.includes("pending approval")) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Alert className="max-w-md border-amber-200 bg-amber-50">
            <UserCheck className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              You currently have no assigned tasks. Please wait for admin approval.
            </AlertDescription>
          </Alert>
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage || "Failed to load tasks. Please try refreshing the page."}
          </AlertDescription>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  // Check for permissions first
  if (!permissions.canViewTasks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view tasks. Please contact your administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        {permissions.canCreateTasks && (
        <AddTaskSheet 
          trigger={
            <Button onClick={() => setIsAddingTask(true)}>
              Add Task
            </Button>
          }
          onSuccess={() => refetch()}
        />
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load tasks. Please try refreshing the page.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">0 Tasks</h3>
            <p className="text-muted-foreground mb-4">
              {permissions.isPendingApproval ? 
                "You currently have no assigned tasks. Please wait for admin approval to access the full task management system." :
                permissions.canCreateTasks ? 
                  "You don't have any tasks assigned to you yet. Create your first task to get started." : 
                  "You don't have any tasks assigned to you yet. New tasks will appear here when they're assigned to you."
              }
            </p>
            {permissions.canCreateTasks && !permissions.isPendingApproval && (
              <AddTaskSheet 
                trigger={
                  <Button>
                    Create Your First Task
          </Button>
                }
                onSuccess={() => refetch()}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Task</th>
                <th className="text-left py-3 px-4 font-medium">Assignee</th>
                <th className="text-left py-3 px-4 font-medium">Priority</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Date Range</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => {
                // Check if date range is in the past and task is not completed
                const isOverdue = 
                  ((task.startDate && isPast(parseISO(task.startDate))) ||
                   (task.endDate && isPast(parseISO(task.endDate)))) && 
                  task.status !== 'COMPLETED'
                
                return (
                  <tr key={task.id} className="hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{task.title}</span>
                        {task.project && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {task.project.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex -space-x-2 overflow-hidden">
                          {task.assignees.slice(0, 4).map((assignee, index) => (
                            <Avatar key={assignee.id} className="h-8 w-8 ring-2 ring-background inline-block">
                              <AvatarImage 
                                src={assignee.avatar || ""} 
                                alt={`${assignee.firstName} ${assignee.lastName}`} 
                              />
                              <AvatarFallback>
                                {assignee.firstName?.charAt(0)}{assignee.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 4 && (
                            <Avatar className="h-8 w-8 ring-2 ring-background bg-primary inline-flex items-center justify-center">
                              <span className="text-xs text-primary-foreground font-medium">
                                +{task.assignees.length - 4}
                              </span>
                            </Avatar>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                        {formatPriority(task.priority)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isOverdue ? 'bg-red-100 text-red-800' : getStatusClass(task.status)}`}>
                        {getStatusIcon(isOverdue ? 'OVERDUE' : task.status)}
                        {isOverdue ? 'Overdue' : formatStatus(task.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {(task.startDate || task.endDate) ? (
                        <div className="flex flex-col">
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            {task.startDate && format(parseISO(task.startDate), 'LLL dd, y')}
                            {task.startDate && task.endDate && " - "}
                            {task.endDate && format(parseISO(task.endDate), 'LLL dd, y')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isOverdue ? 'Overdue' : 
                              task.startDate ? 
                                formatDistanceToNow(parseISO(task.startDate), { addSuffix: true }) :
                                task.endDate ?
                                  `Due ${formatDistanceToNow(parseISO(task.endDate), { addSuffix: true })}` :
                                  ''
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No date set</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View task sheet */}
                        <ViewTaskSheet 
                          taskId={task.id}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">View task details</span>
                              <Eye className="h-4 w-4" />
                            </Button>
                          }
                        />
                        
                        {/* Edit task sheet - only show if user can edit */}
                        {(() => {
                          const canEdit = permissions.canEditTask(task);
                          
                          // Debug logging for SUPER_ADMIN
                          if (user?.role === 'SUPER_ADMIN') {
                            console.log(`[Tasks Client] SUPER_ADMIN Task ${task.id} Edit Check:`, {
                              canEdit,
                              taskCreatorId: task.createdBy?.id,
                              taskAssignees: task.assignees?.map(a => a.id),
                              projectOwnerId: task.project?.id,
                              currentUserId: user.id
                            });
                          }
                          
                          return canEdit ? (
                        <EditTaskSheet 
                          taskId={task.id}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">Edit task</span>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                          onSuccess={() => refetch()}
                        />
                          ) : null;
                        })()}
                        
                        {/* Task actions dropdown */}
                        {(() => {
                          const canEdit = permissions.canEditTask(task);
                          const canDelete = permissions.canDeleteTask(task);
                          
                          // Debug logging for SUPER_ADMIN
                          if (user?.role === 'SUPER_ADMIN') {
                            console.log(`[Tasks Client] SUPER_ADMIN Task ${task.id} Actions Check:`, {
                              canEdit,
                              canDelete,
                              showDropdown: canEdit || canDelete
                            });
                          }
                          
                          return (canEdit || canDelete) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <span className="sr-only">Open actions</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                                {canEdit && task.status !== 'COMPLETED' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                                className="text-green-600"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                <span>Mark Complete</span>
                              </DropdownMenuItem>
                            )}
                                {canEdit && task.status === 'COMPLETED' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                <span>Mark In Progress</span>
                              </DropdownMenuItem>
                            )}
                                {canDelete && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Task</span>
                            </DropdownMenuItem>
                                )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                          ) : null;
                        })()}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 