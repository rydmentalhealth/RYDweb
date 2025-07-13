"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CheckIcon, ClockIcon, LocateIcon, ArrowRightIcon } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

// Task board data types
interface TaskData {
  id: string
  title: string
  description?: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE"
  startDate?: string
  endDate?: string
  location?: string
  project?: {
    id: string
    name: string
  }
}

interface TaskBoardProps {
  tasks: TaskData[]
  isLoading?: boolean
  onUpdateTaskStatus?: (taskId: string, newStatus: string) => void
}

export function TaskBoard({ tasks, isLoading = false, onUpdateTaskStatus }: TaskBoardProps) {
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Group tasks by status
  const notStartedTasks = tasks.filter(task => task.status === "NOT_STARTED")
  const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS")
  const completedTasks = tasks.filter(task => task.status === "COMPLETED")
  const overdueTasks = tasks.filter(task => task.status === "OVERDUE")
  
  // Helper function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-none">Low</Badge>
      case "MEDIUM":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-none">Medium</Badge>
      case "HIGH":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-none">High</Badge>
      case "URGENT":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-none">Urgent</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }
  
  // Helper function to update task status
  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus)
    }
  }
  
  // Render task card
  const renderTaskCard = (task: TaskData) => (
    <Card key={task.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{task.title}</CardTitle>
          {getPriorityBadge(task.priority)}
        </div>
        {task.project && (
          <CardDescription className="text-xs">
            Project: {task.project.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        {task.description && (
          <p className="text-sm mb-3">{task.description}</p>
        )}
        <div className="space-y-1 text-xs text-muted-foreground">
          {(task.startDate || task.endDate) && (
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>
                {task.startDate && format(new Date(task.startDate), "MMM d")}
                {task.endDate && task.startDate && " - "}
                {task.endDate && format(new Date(task.endDate), "MMM d")}
              </span>
            </div>
          )}
          {task.location && (
            <div className="flex items-center">
              <LocateIcon className="h-3 w-3 mr-1" />
              <span>{task.location}</span>
            </div>
          )}
          {task.endDate && (
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              <span>Due {formatDistanceToNow(new Date(task.endDate), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        {task.status !== "COMPLETED" ? (
          <div className="flex w-full justify-between">
            {task.status === "NOT_STARTED" && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
              >
                Start Task
              </Button>
            )}
            {task.status === "IN_PROGRESS" && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-green-600" 
                onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            {task.status === "OVERDUE" && (
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-none">Overdue</Badge>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-green-600" 
                  onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Mark Complete
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-none">
            <CheckIcon className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
  
  return (
    <div className="w-full">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">
            All ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="not-started">
            Not Started ({notStartedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({overdueTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Badge className="mr-2 bg-slate-200 text-slate-700 hover:bg-slate-200">
                  {notStartedTasks.length}
                </Badge>
                Not Started
              </h3>
              <div className="space-y-2">
                {notStartedTasks.map(renderTaskCard)}
                {notStartedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks to show</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Badge className="mr-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {inProgressTasks.length}
                </Badge>
                In Progress
              </h3>
              <div className="space-y-2">
                {inProgressTasks.map(renderTaskCard)}
                {inProgressTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks to show</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-100">
                  {completedTasks.length}
                </Badge>
                Completed
              </h3>
              <div className="space-y-2">
                {completedTasks.map(renderTaskCard)}
                {completedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No tasks to show</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="not-started">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {notStartedTasks.map(renderTaskCard)}
            {notStartedTasks.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">No tasks to show</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {inProgressTasks.map(renderTaskCard)}
            {inProgressTasks.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">No tasks to show</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {completedTasks.map(renderTaskCard)}
            {completedTasks.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">No tasks to show</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="overdue">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {overdueTasks.map(renderTaskCard)}
            {overdueTasks.length === 0 && (
              <p className="text-muted-foreground col-span-full text-center py-4">No tasks to show</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 