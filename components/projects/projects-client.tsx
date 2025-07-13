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
  PlayIcon,
  PauseIcon,
  XCircleIcon,
  CalendarRange,
  ShieldAlert
} from "lucide-react"
import { formatDistanceToNow, isPast, parseISO, format } from "date-fns"
import { useProjects, useDeleteProject } from "@/lib/hooks/use-projects"
import { Skeleton } from "@/components/ui/skeleton"
import { ViewProjectSheet } from "@/components/projects/view-project-sheet"
import { EditProjectSheet } from "@/components/projects/edit-project-sheet"
import { AddProjectSheet } from "@/components/projects/add-project-sheet"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
      return 'bg-blue-100 text-blue-800'
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'ON_HOLD':
      return 'bg-yellow-100 text-yellow-800'
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'PLANNING':
      return <Clock className="h-3 w-3 mr-1" />
    case 'ACTIVE':
      return <PlayIcon className="h-3 w-3 mr-1" />
    case 'ON_HOLD':
      return <PauseIcon className="h-3 w-3 mr-1" />
    case 'COMPLETED':
      return <CheckCircle2 className="h-3 w-3 mr-1" />
    case 'CANCELLED':
      return <XCircleIcon className="h-3 w-3 mr-1" />
    default:
      return <Clock className="h-3 w-3 mr-1" />
  }
}

// Get project progress
function getProjectProgress(project: any): number {
  if (!project.tasks || project.tasks.length === 0) return 0
  
  const completedTasks = project.tasks.filter((task: any) => task.status === 'COMPLETED').length
  return Math.round((completedTasks / project.tasks.length) * 100)
}

export function ProjectsClient() {
  const permissions = usePermissions()
  
  // Fetch projects with React Query
  const { 
    data: projects = [], 
    isLoading, 
    isError,
    error,
    refetch 
  } = useProjects()
  
  // Set up project deletion mutation
  const deleteProject = useDeleteProject()

  // Debug logging
  console.log("[ProjectsClient] Permissions:", {
    canViewProjects: permissions.canViewProjects,
    userRole: permissions.user.role,
    userStatus: permissions.user.status,
    userId: permissions.user.id,
    isSuperAdmin: permissions.isSuperAdmin
  })
  
  console.log("[ProjectsClient] Projects data:", projects)
  
  // Handler for quick status update
  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update project status")
      }
      
      toast.success(`Project marked as ${formatStatus(newStatus)}`)
      refetch()
    } catch (error) {
      toast.error("Failed to update project status")
      console.error("Error updating project status:", error)
    }
  }
  
  // Handler for project deletion
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }
    
    try {
      await deleteProject.mutateAsync(projectId)
      toast.success("Project deleted successfully")
      refetch()
    } catch (error) {
      toast.error("Failed to delete project")
      console.error("Error deleting project:", error)
    }
  }
  
  // Check if user can perform actions on a specific project
  const getProjectPermissions = (project: any) => {
    if (!permissions.user.id) {
      return { canView: false, canEdit: false, canDelete: false }
    }
    
    const projectMemberIds = project.members?.map((m: any) => m.id) || []
    const projectPermissions = permissions.checkProjectPermissions(
      project.owner?.id || project.ownerId, // Handle both possible field names
      projectMemberIds
    )
    
    console.log("[ProjectsClient] Project permissions for", project.name, ":", {
      projectId: project.id,
      ownerId: project.owner?.id || project.ownerId,
      memberIds: projectMemberIds,
      permissions: projectPermissions,
      userRole: permissions.user.role,
      isSuperAdmin: permissions.isSuperAdmin
    })
    
    return projectPermissions
  }

  // Show access denied message for insufficient permissions
  if (!permissions.canViewProjects) {
    console.log("[ProjectsClient] Access denied - canViewProjects:", permissions.canViewProjects)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view projects. Please contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
  return (
    <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    console.log("[ProjectsClient] Error loading projects:", error)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md" variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            Error loading projects: {error?.message || 'Unknown error occurred'}. Please try again later.
          </AlertDescription>
        </Alert>
        </div>
    )
  }

  if (projects.length === 0) {
    console.log("[ProjectsClient] No projects found")
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No projects found.</p>
        {permissions.canCreateProjects && (
          <AddProjectSheet
            trigger={
              <Button>
                Create Your First Project
              </Button>
            }
            onSuccess={() => refetch()}
          />
        )}
        </div>
    )
  }

  // Filter projects with detailed logging
  const visibleProjects = projects.filter((project: any) => {
    const progress = getProjectProgress(project)
    const projectPermissions = getProjectPermissions(project)
    
    console.log("[ProjectsClient] Checking project visibility:", {
      projectName: project.name,
      canView: projectPermissions.canView,
      userRole: permissions.user.role,
      isSuperAdmin: permissions.isSuperAdmin
    })
    
    // For SUPER_ADMIN, always allow viewing (override permission check)
    if (permissions.isSuperAdmin) {
      console.log("[ProjectsClient] SUPER_ADMIN override - allowing project view:", project.name)
      return true
    }
    
    // For other roles, check permissions normally
    return projectPermissions.canView
  })
  
  console.log("[ProjectsClient] Visible projects after filtering:", visibleProjects.length, "out of", projects.length)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project: any) => {
            const progress = getProjectProgress(project)
          const projectPermissions = getProjectPermissions(project)
            
            return (
            <Card key={project.id} className="flex flex-col">
                <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-none">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {project.description || "No description provided."}
                      </CardDescription>
                    </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Always show view action */}
                    <ViewProjectSheet 
                      projectId={project.id}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                    
                    {/* Show action dropdown for SUPER_ADMIN or if user has edit/delete permissions */}
                    {(permissions.isSuperAdmin || projectPermissions.canEdit || projectPermissions.canDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                          <span className="sr-only">Open actions</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ViewProjectSheet 
                          projectId={project.id}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                          }
                        />
                          
                          {(permissions.isSuperAdmin || projectPermissions.canEdit) && (
                        <EditProjectSheet 
                          projectId={project.id}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit Project</span>
                            </DropdownMenuItem>
                          }
                          onSuccess={() => refetch()}
                        />
                          )}
                          
                          {(permissions.isSuperAdmin || projectPermissions.canDelete) && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Project</span>
                        </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    )}
                  </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="outline" className={`${getStatusClass(project.status)} border-none`}>
                      {getStatusIcon(project.status)}
                      {formatStatus(project.status)}
                    </Badge>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <CalendarRange className="h-3 w-3 mr-1" />
                      <span>
                        {project.startDate && format(parseISO(project.startDate), 'MMM d, yyyy')}
                        {project.endDate && ' - '}
                        {project.endDate && format(parseISO(project.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {/* Team members */}
                  {project.members && project.members.length > 0 && (
                    <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">Team</span>
                      <span className="text-xs text-muted-foreground">
                        {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex -space-x-1">
                      {project.members.slice(0, 4).map((member: any) => (
                        <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={member.avatar} alt={`${member.firstName || ''} ${member.lastName || ''}`} />
                          <AvatarFallback className="text-xs">
                            {`${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      {project.members.length > 4 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{project.members.length - 4}
                            </span>
                        </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                  <span>
                    Created {formatDistanceToNow(parseISO(project.createdAt), { addSuffix: true })}
                  </span>
                  <span>
                    {project.tasks?.length || 0} task{(project.tasks?.length || 0) !== 1 ? 's' : ''}
                  </span>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
    </div>
  )
} 