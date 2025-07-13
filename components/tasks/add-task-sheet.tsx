// @ts-nocheck
// Apply this comment to temporarily ignore TypeScript errors in this file

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
import { useAddTask } from "@/lib/hooks/use-tasks"
import { useUsers } from "@/lib/hooks/use-users"
import { useProjects } from "@/lib/hooks/use-projects"
import { useTeams } from "@/lib/hooks/use-teams"
import { CalendarIcon, Loader2, X, AlertTriangle, Users, Shield } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddTaskSheetProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  teamIds: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  location: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
})

export function AddTaskSheet({ trigger, onSuccess }: AddTaskSheetProps) {
  const [open, setOpen] = useState(false)
  const [assigneeValidationError, setAssigneeValidationError] = useState<string | null>(null)
  
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeIds: [],
      teamIds: [],
      projectId: "",
      startDate: null,
      endDate: null,
      location: "",
      priority: "MEDIUM",
      status: "NOT_STARTED",
    },
  })

  // Fetch users for assignee dropdown
  const { data: users = [], isLoading: isLoadingUsers } = useUsers()
  
  // Fetch teams for team assignment dropdown  
  const { data: teams = [], isLoading: isLoadingTeams } = useTeams({ activeOnly: true })
  
  // Fetch projects for project dropdown
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  
  // Add task mutation
  const addTask = useAddTask()

  // Filter only active users for assignment
  const activeUsers = users.filter(user => user.status === 'ACTIVE')
  const inactiveUsers = users.filter(user => user.status !== 'ACTIVE')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    form.setValue(name as any, value)
  }

  const handleSelectChange = (name: string, value: string) => {
    // Handle special values for assigneeId and projectId
    if (name === 'assigneeIds' && (value === 'loading' || value === 'no-users')) {
      return; // Ignore these special values
    }
    
    if (name === 'teamIds' && (value === 'loading' || value === 'no-teams')) {
      return; // Ignore these special values
    }
    
    if (name === 'projectId' && (value === 'loading' || value === 'no-projects')) {
      return; // Ignore these special values
    }
    
    form.setValue(name as any, value)
  }

  const handleAddAssignee = (userId: string) => {
    // Clear any previous validation errors
    setAssigneeValidationError(null)
    
    const currentAssignees = form.getValues("assigneeIds") || [];
    if (!currentAssignees.includes(userId)) {
      // Check if the user is active
      const selectedUser = users.find(u => u.id === userId)
      if (selectedUser && selectedUser.status !== 'ACTIVE') {
        setAssigneeValidationError(`Cannot assign task to ${selectedUser.firstName} ${selectedUser.lastName}: User is ${selectedUser.status.toLowerCase()}`)
        return
      }
      
      form.setValue("assigneeIds", [...currentAssignees, userId]);
    }
  }

  const handleAddTeam = (teamId: string) => {
    const currentTeams = form.getValues("teamIds") || [];
    if (!currentTeams.includes(teamId)) {
      form.setValue("teamIds", [...currentTeams, teamId]);
    }
  }

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    form.setValue("startDate", dateRange?.from)
    form.setValue("endDate", dateRange?.to)
  }

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      // Clear validation errors
      setAssigneeValidationError(null)
      
      // Final validation of assignees before submission
      if (data.assigneeIds && data.assigneeIds.length > 0) {
        const invalidAssignees = data.assigneeIds.filter(id => {
          const user = users.find(u => u.id === id)
          return !user || user.status !== 'ACTIVE'
        })
        
        if (invalidAssignees.length > 0) {
          setAssigneeValidationError("One or more selected assignees are invalid, inactive, or suspended")
          return
        }
      }
      
      // Convert "none" value to null/undefined for projectId
      if (data.projectId === "none") {
        data.projectId = null;
      }
      
      await addTask.mutateAsync(data)
      toast.success("Task created successfully")
      form.reset()
      setAssigneeValidationError(null)
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      // Handle specific error messages from the API
      const errorMessage = error?.response?.data?.message || error?.message
      
      if (errorMessage?.includes("assignees are invalid")) {
        setAssigneeValidationError(errorMessage)
        toast.error(errorMessage)
      } else if (errorMessage?.includes("permission")) {
        toast.error("You do not have permission to perform this action")
      } else if (errorMessage?.includes("not active")) {
        toast.error("Your account is not active. Please contact an administrator.")
      } else {
        toast.error(errorMessage || "Failed to create task")
      }
      
      console.error("Error adding task:", error)
    }
  });

  // Find assignee names for displaying selected assignees
  const getAssigneeName = (id: string) => {
    const assignee = users.find(user => user.id === id)
    return assignee ? `${assignee.firstName} ${assignee.lastName}` : "Unknown"
  }

  // Find team names for displaying selected teams
  const getTeamName = (id: string) => {
    const team = teams.find(team => team.id === id)
    return team ? team.name : "Unknown"
  }

  // Helper to remove a selected assignee
  const removeAssignee = (id: string) => {
    const currentAssignees = form.getValues("assigneeIds") || []
    form.setValue("assigneeIds", currentAssignees.filter(a => a !== id))
    // Clear validation error when removing assignees
    setAssigneeValidationError(null)
  }

  // Helper to remove a selected team
  const removeTeam = (id: string) => {
    const currentTeams = form.getValues("teamIds") || []
    form.setValue("teamIds", currentTeams.filter(t => t !== id))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Task</SheetTitle>
          <SheetDescription>
            Create a new task and assign it to users or teams.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={3}
            />
          </div>
          
          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value)}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Assignees */}
          <div className="space-y-2">
            <Label htmlFor="assigneeIds">Assignees</Label>
            <Select
              onValueChange={(value) => handleAddAssignee(value)}
            >
              <SelectTrigger id="assigneeIds">
                <SelectValue placeholder="Select assignees" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingUsers ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </SelectItem>
                ) : activeUsers.length === 0 ? (
                  <SelectItem value="no-users" disabled>No active users found</SelectItem>
                ) : (
                  <>
                    {activeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                    ))}
                    {inactiveUsers.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                          Inactive Users (Cannot be assigned)
                        </div>
                        {inactiveUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id} disabled>
                            {user.firstName} {user.lastName} ({user.status.toLowerCase()})
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </>
                )}
              </SelectContent>
            </Select>
            
            {/* Assignee validation error */}
            {assigneeValidationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{assigneeValidationError}</AlertDescription>
              </Alert>
            )}
            
            {/* Display selected assignees */}
            {form.watch("assigneeIds")?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.watch("assigneeIds").map(id => (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {getAssigneeName(id)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeAssignee(id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Teams */}
          <div className="space-y-2">
            <Label htmlFor="teamIds">Teams</Label>
            <Select
              onValueChange={(value) => handleAddTeam(value)}
            >
              <SelectTrigger id="teamIds">
                <SelectValue placeholder="Select teams" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTeams ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </SelectItem>
                ) : teams.length === 0 ? (
                  <SelectItem value="no-teams" disabled>No active teams found</SelectItem>
                ) : (
                  teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {/* Display selected teams */}
            {form.watch("teamIds")?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.watch("teamIds").map(id => (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {getTeamName(id)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTeam(id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select
              value={form.watch("projectId")}
              onValueChange={(value) => form.setValue("projectId", value)}
            >
              <SelectTrigger id="projectId">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {isLoadingProjects ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  </SelectItem>
                ) : projects.length === 0 ? (
                  <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              dateRange={{ 
                from: form.watch("startDate") || undefined, 
                to: form.watch("endDate") || undefined 
              }}
              onSelect={handleDateRangeChange}
              className="w-full"
            />
          </div>
          
          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="Optional location"
            />
          </div>
          
          <SheetFooter>
            <Button 
              type="submit" 
              disabled={addTask.isPending}
            >
              {addTask.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Task
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 