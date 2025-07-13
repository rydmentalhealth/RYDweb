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
import { useAddProject } from "@/lib/hooks/use-projects"
import { useTeamMembers } from "@/lib/hooks/use-team-members"
import { CalendarIcon, Loader2, X, AlertTriangle } from "lucide-react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddProjectSheetProps {
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

export function AddProjectSheet({ trigger, onSuccess }: AddProjectSheetProps) {
  const [open, setOpen] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberValidationError, setMemberValidationError] = useState<string | null>(null)
  
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
  
  // Fetch team members for assignee dropdown
  const { data: teamMembers = [], isLoading: isLoadingTeamMembers } = useTeamMembers()
  
  // Add project mutation
  const addProject = useAddProject()

  // Filter only active team members for assignment
  const activeTeamMembers = teamMembers.filter(member => member.status === 'ACTIVE')
  const inactiveMembers = teamMembers.filter(member => member.status !== 'ACTIVE')

  const handleSelectChange = (name: string, value: string) => {
    form.setValue(name as any, value)
  }

  const handleMemberSelection = (memberId: string) => {
    // Clear any previous validation errors
    setMemberValidationError(null)
    
    // Check if the member is active before adding
    const selectedMember = teamMembers.find(m => m.id === memberId)
    if (selectedMember && selectedMember.status !== 'ACTIVE') {
      setMemberValidationError(`Cannot add ${selectedMember.firstName} ${selectedMember.lastName} to project: User is ${selectedMember.status.toLowerCase()}`)
      return
    }
    
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
      // Clear validation errors
      setMemberValidationError(null)
      
      // Final validation of selected members before submission
      if (selectedMembers.length > 0) {
        const invalidMembers = selectedMembers.filter(id => {
          const member = teamMembers.find(m => m.id === id)
          return !member || member.status !== 'ACTIVE'
        })
        
        if (invalidMembers.length > 0) {
          setMemberValidationError("One or more selected team members are invalid, inactive, or suspended")
          return
        }
      }
      
      await addProject.mutateAsync({
        ...data,
        startDate: data.startDate ? data.startDate.toISOString() : null,
        endDate: data.endDate ? data.endDate.toISOString() : null,
        members: selectedMembers
      })
      toast.success("Project created successfully")
      form.reset()
      setSelectedMembers([])
      setMemberValidationError(null)
      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      // Handle specific error messages from the API
      const errorMessage = error?.response?.data?.message || error?.message
      
      if (errorMessage?.includes("members are invalid")) {
        setMemberValidationError(errorMessage)
        toast.error(errorMessage)
      } else if (errorMessage?.includes("permission")) {
        toast.error("You do not have permission to perform this action")
      } else if (errorMessage?.includes("not active")) {
        toast.error("Your account is not active. Please contact an administrator.")
      } else {
        toast.error(errorMessage || "Failed to create project")
      }
      
      console.error("Error creating project:", error)
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
    // Clear validation error when removing members
    setMemberValidationError(null)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Project</SheetTitle>
          <SheetDescription>
            Add a new project and assign team members to it.
          </SheetDescription>
        </SheetHeader>
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
                  onSelect={(date) => form.setValue("endDate", date)}
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
            
            {/* Member validation error */}
            {memberValidationError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{memberValidationError}</AlertDescription>
              </Alert>
            )}
            
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
              disabled={addProject.isPending}
            >
              {addProject.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Project
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 