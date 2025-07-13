"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { useProject } from "@/lib/hooks/use-projects"
import { 
  CalendarRange, 
  ClipboardList, 
  Clock, 
  Info, 
  Users, 
  CheckCircle2
} from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface ViewProjectSheetProps {
  projectId: string
  trigger: React.ReactNode
}

// Helper functions for formatting
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PLANNING': 'Planning',
    'ACTIVE': 'Active',
    'COMPLETED': 'Completed',
    'ON_HOLD': 'On Hold',
    'CANCELLED': 'Cancelled'
  }
  return statusMap[status] || status
}

// Helper functions for styling
function getStatusClass(status: string): string {
  switch (status) {
    case 'PLANNING':
      return 'bg-amber-100 text-amber-800'
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    case 'ON_HOLD':
      return 'bg-gray-100 text-gray-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function ViewProjectSheet({ projectId, trigger }: ViewProjectSheetProps) {
  const [open, setOpen] = useState(false)
  
  // Fetch project data
  const { 
    data: project, 
    isLoading, 
    isError 
  } = useProject(projectId)
  
  // Calculate project progress
  const getProjectProgress = () => {
    if (!project?.tasks || project.tasks.length === 0) return 0
    
    const completedTasks = project.tasks.filter((task: any) => task.status === 'COMPLETED').length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-4">
            <p className="text-red-500">Failed to load project details</p>
          </div>
        ) : project ? (
          <>
            <SheetHeader>
              <SheetTitle>{project.name}</SheetTitle>
              <SheetDescription>
                {project.description || "No description provided."}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Project Overview Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>Status</span>
                    </div>
                    <Badge variant="outline" className={`${getStatusClass(project.status)} border-none`}>
                      {formatStatus(project.status)}
                    </Badge>
                  </div>
                  
                  {/* Dates */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarRange className="h-4 w-4" />
                      <span>Timeline</span>
                    </div>
                    <div className="text-sm">
                      {project.startDate && format(parseISO(project.startDate), 'MMM d, yyyy')}
                      {project.endDate && ' - '}
                      {project.endDate && format(parseISO(project.endDate), 'MMM d, yyyy')}
                    </div>
                  </div>
                  
                  {/* Created */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Created</span>
                    </div>
                    <div className="text-sm">
                      {formatDistanceToNow(parseISO(project.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{getProjectProgress()}%</span>
                    </div>
                    <Progress value={getProjectProgress()} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Tabs defaultValue="tasks">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>
                
                {/* Tasks Tab */}
                <TabsContent value="tasks" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Tasks</h3>
                    </div>
                    <Badge variant="outline">
                      {project.tasks?.length || 0} total
                    </Badge>
                  </div>
                  
                  {project.tasks && project.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {project.tasks.map((task: any) => (
                        <div key={task.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{task.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {task.status === 'COMPLETED' ? (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </span>
                                ) : (
                                  <span>{formatStatus(task.status)}</span>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className={`${getPriorityClass(task.priority)}`}>
                              {formatPriority(task.priority)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No tasks assigned to this project yet
                    </div>
                  )}
                </TabsContent>
                
                {/* Team Tab */}
                <TabsContent value="team" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Team Members</h3>
                    </div>
                    <Badge variant="outline">
                      {project.members?.length || 0} members
                    </Badge>
                  </div>
                  
                  {project.members && project.members.length > 0 ? (
                    <div className="space-y-3">
                      {project.members.map((memberObj: any) => {
                        const member = memberObj.member;
                        return (
                          <div key={memberObj.id} className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage 
                                src={member.avatar || ""} 
                                alt={`${member.firstName} ${member.lastName}`} 
                              />
                              <AvatarFallback>
                                {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.firstName} {member.lastName}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatProjectRole(memberObj.role)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No team members assigned to this project yet
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No project data found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Helper functions for task and members
function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'URGENT': 'Urgent'
  }
  return priorityMap[priority] || priority
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

function formatProjectRole(role: string): string {
  const roleMap: Record<string, string> = {
    'LEADER': 'Project Leader',
    'COORDINATOR': 'Coordinator',
    'MEMBER': 'Team Member'
  }
  return roleMap[role] || role
} 