"use client"

import { useState, useEffect } from "react"
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
import { useTask, useUpdateTask } from "@/lib/hooks/use-tasks"
import { useProjects } from "@/lib/hooks/use-projects" 
import { useTeamMembers } from "@/lib/hooks/use-team-members"
import type { TeamMember } from "@/lib/services/team-service"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Check, ChevronDown, X, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditTaskSheetProps {
  taskId: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

// Form schema for task editing
const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  projectId: z.string().nullable().optional(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  location: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

export function EditTaskSheet({ taskId, trigger, onSuccess }: EditTaskSheetProps) {
  const [open, setOpen] = useState(false)
  const [assigneeValidationError, setAssigneeValidationError] = useState<string | null>(null)
  
  // Fetch team members and projects for dropdown options
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useTeamMembers()
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects()
  
  // Filter only active team members for assignment
  const activeTeamMembers = teamMembers.filter(member => member.status === 'ACTIVE')
  const inactiveMembers = teamMembers.filter(member => member.status !== 'ACTIVE')
  
  // Debug logging for assignee issues
  console.log("[EditTaskSheet] Debug Info:", {
    totalTeamMembers: teamMembers.length,
    activeTeamMembers: activeTeamMembers.length,
    inactiveMembers: inactiveMembers.length,
    isLoadingTeamMembers,
    activeMembers: activeTeamMembers.map(m => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      status: m.status
    }))
  });
  
  // Form setup
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeIds: [],
      projectId: "",
      startDate: null,
      endDate: null,
      location: "",
      priority: "",
      status: "",
    },
  })
  
  // Fetch task data
  const { 
    data: task, 
    isLoading, 
    isError 
  } = useTask(taskId)
  
  // Set up update mutation
  const updateTask = useUpdateTask(taskId)
  
  // Populate form when task data is loaded
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        assigneeIds: task.assignees ? task.assignees.map(a => a.id) : [],
        projectId: task.projectId || "",
        startDate: task.startDate ? new Date(task.startDate) : null,
        endDate: task.endDate ? new Date(task.endDate) : null,
        location: task.location || "",
        priority: task.priority || "",
        status: task.status || "",
      })
    }
  }, [task, form])
  
  // Form submission handler
  const onSubmit = async (data: TaskFormData) => {
    console.log("[EditTaskSheet] Form submission started:", {
      submittedData: data,
      taskId,
      currentAssignees: task?.assignees?.map(a => ({ id: a.id, name: `${a.firstName} ${a.lastName}` }))
    });
    
    try {
      // Clear validation errors
      setAssigneeValidationError(null)
      
      // Final validation of assignees before submission
      if (data.assigneeIds && data.assigneeIds.length > 0) {
        const invalidAssignees = data.assigneeIds.filter(id => {
          const member = teamMembers.find(m => m.id === id)
          return !member || member.status !== 'ACTIVE'
        })
        
        if (invalidAssignees.length > 0) {
          setAssigneeValidationError("One or more selected assignees are invalid, inactive, or suspended")
          return
        }
      }
      
      // Create a new object with the correct types
      const taskData = {
        ...data,
        projectId: data.projectId === "none" || data.projectId === null ? undefined : data.projectId
      };
      
      await updateTask.mutateAsync(taskData)
      toast.success("Task updated successfully")
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
        toast.error(errorMessage || "Failed to update task")
      }
      
      console.error("Error updating task:", error)
    }
  }
  
  // Find assignee names for displaying selected assignees
  const getAssigneeName = (id: string) => {
    const assignee = teamMembers.find((member: TeamMember) => member.id === id)
    return assignee ? `${assignee.firstName} ${assignee.lastName}` : "Unknown"
  }
  
  // Helper to remove a selected assignee
  const removeAssignee = (id: string) => {
    const currentAssignees = form.getValues("assigneeIds") || []
    form.setValue("assigneeIds", currentAssignees.filter((a: string) => a !== id))
    setAssigneeValidationError(null)
  }

  // Add assignee handler (copied from AddTaskSheet)
  const handleAddAssignee = (memberId: string) => {
    // Clear any previous validation errors
    setAssigneeValidationError(null)
    
    const currentAssignees = form.getValues("assigneeIds") || [];
    if (!currentAssignees.includes(memberId)) {
      // Check if the member is active
      const selectedMember = teamMembers.find(m => m.id === memberId)
      if (selectedMember && selectedMember.status !== 'ACTIVE') {
        setAssigneeValidationError(`Cannot assign task to ${selectedMember.firstName} ${selectedMember.lastName}: User is ${selectedMember.status.toLowerCase()}`)
        return
      }
      
      form.setValue("assigneeIds", [...currentAssignees, memberId]);
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-4">
            <p className="text-red-500">Failed to load task details</p>
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Edit Task</SheetTitle>
              <SheetDescription>
                Make changes to the task details.
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Task description" 
                          className="min-h-[100px]" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Multiple Assignees - Using exact AddTaskSheet implementation */}
                <FormField
                  control={form.control}
                  name="assigneeIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignees</FormLabel>
                      <Select
                        onValueChange={(value) => handleAddAssignee(value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignees" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingTeamMembers ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                              </div>
                            </SelectItem>
                          ) : activeTeamMembers.length === 0 ? (
                            <SelectItem value="no-members" disabled>No active team members found</SelectItem>
                          ) : (
                            <>
                              {activeTeamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.firstName} {member.lastName}
                                </SelectItem>
                              ))}
                              {inactiveMembers.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                                    Inactive Members (Cannot be assigned)
                                  </div>
                                  {inactiveMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id} disabled>
                                      {member.firstName} {member.lastName} ({member.status.toLowerCase()})
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
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((id: string) => (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Project */}
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "LLL dd, y")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "LLL dd, y")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Task location" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Priority & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <SheetFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateTask.isPending}
                  >
                    {updateTask.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
} 