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
import { useProject, useUpdateProject } from "@/lib/hooks/use-projects"
import { useTeamMembers } from "@/lib/hooks/use-team-members"
import { CalendarIcon, Loader2, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Skeleton } from "@/components/ui/skeleton"

interface EditProjectSheetProps {
  projectId: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  status: z.string(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date().optional().nullable(),
});

export function EditProjectSheet({ projectId, trigger, onSuccess }: EditProjectSheetProps) {
  const [open, setOpen] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  
  // Fetch project data
  const { data: project, isLoading, isError } = useProject(projectId)
  
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "PLANNING",
      startDate: new Date(),
      endDate: null,
    },
  })
  
  // Populate form when project data is loaded
  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "PLANNING",
        startDate: project.startDate ? new Date(project.startDate) : new Date(),
        endDate: project.endDate ? new Date(project.endDate) : null,
      })
      
      // Set selected members
      if (project.members) {
        setSelectedMembers(project.members.map((m: any) => m.member.id))
      }
    }
  }, [project, form])
  
  // Fetch team members for assignee dropdown
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useTeamMembers()
  
  // Update project mutation
  const updateProject = useUpdateProject(projectId)

  const handleSelectChange = (name: string, value: string) => {
    form.setValue(name as any, value)
  }

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await updateProject.mutateAsync({
        ...data,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        endDate: data.endDate ? data.endDate.toISOString() : null,
        members: selectedMembers
      })
      toast.success("Project updated successfully")
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      toast.error("Failed to update project")
      console.error("Error updating project:", error)
    }
  })

  // Find member names for displaying selected members
  const getMemberName = (id: string) => {
    const member = teamMembers.find(member => member.id === id)
    return member ? `${member.firstName} ${member.lastName}` : "Unknown"
  }

  // Helper to remove a selected member
  const removeMember = (id: string) => {
    setSelectedMembers(prev => prev.filter(memberId => memberId !== id))
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Project</SheetTitle>
          <SheetDescription>
            Make changes to the project details.
          </SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="py-4 text-center text-red-500">
            Failed to load project details
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6 py-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
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
            
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("startDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("startDate") ? (
                      format(form.watch("startDate"), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("startDate") || undefined}
                    onSelect={(date) => form.setValue("startDate", date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            
            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("endDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("endDate") ? (
                      format(form.watch("endDate") as Date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("endDate") || undefined}
                    onSelect={(date) => form.setValue("endDate", date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Team Members */}
            <div className="space-y-2">
              <Label>Team Members</Label>
              <Select onValueChange={handleMemberSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team members" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTeamMembers ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </SelectItem>
                  ) : teamMembers.length === 0 ? (
                    <SelectItem value="no-members" disabled>No team members found</SelectItem>
                  ) : (
                    teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {/* Display selected members */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedMembers.map(id => (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {getMemberName(id)}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeMember(id)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <SheetFooter>
              <Button 
                type="submit" 
                disabled={updateProject.isPending}
              >
                {updateProject.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
} 