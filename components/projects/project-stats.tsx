"use client"

import { useProjects } from "@/lib/hooks/use-projects"
import { useTasks } from "@/lib/hooks/use-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, CheckCircle2, Clock, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectStats() {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasks()
  
  // Calculate statistics
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
  
  // Get tasks related to projects
  const projectTasks = tasks.filter(task => task.projectId)
  const projectTasksCompleted = projectTasks.filter(task => task.status === 'COMPLETED').length
  
  // Calculate project completion rate
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
  
  // Calculate task completion rate for projects
  const taskCompletionRate = projectTasks.length > 0 ? 
    Math.round((projectTasksCompleted / projectTasks.length) * 100) : 0
  
  if (isLoadingProjects || isLoadingTasks) {
    return (
      <>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </>
    )
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <p className="text-xs text-muted-foreground">
            {activeProjects} active, {completedProjects} completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {completedProjects} of {totalProjects} projects completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskCompletionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {projectTasksCompleted} of {projectTasks.length} tasks completed
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalProjects > 0 ? 
              Math.round(projects.reduce((acc, p) => acc + (p.members?.length || 0), 0) / totalProjects) : 
              0}
          </div>
          <p className="text-xs text-muted-foreground">
            Average members per project
          </p>
        </CardContent>
      </Card>
    </>
  )
} 