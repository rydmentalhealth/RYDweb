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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useTeamMember, useUpdateTeamMember } from "@/lib/hooks/use-team-members"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamMember, UpdateTeamMemberData } from "@/lib/services/team-service"

// Helper function to convert TeamMember to UpdateTeamMemberData
function teamMemberToFormData(member: TeamMember): UpdateTeamMemberData {
  return {
    firstName: member.firstName || undefined,
    lastName: member.lastName || undefined,
    email: member.email,
    avatar: member.avatar || undefined,
    phone: member.phone || undefined,
    nationalId: member.nationalId || undefined,
    role: member.role,
    status: member.status,
    district: member.district || undefined,
    region: member.region || undefined,
    availability: member.availability || undefined,
    languages: member.languages || undefined,
    skills: member.skills || undefined,
    emergencyContact: member.emergencyContact || undefined,
    jobTitle: member.jobTitle || undefined,
    department: member.department || undefined,
  }
}

interface EditMemberSheetProps {
  memberId: string
  trigger: React.ReactNode
}

export function EditMemberSheet({ memberId, trigger }: EditMemberSheetProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<UpdateTeamMemberData | null>(null)

  // Fetch team member data with React Query
  const { 
    data: member, 
    isLoading: isFetching, 
    isError: isFetchError, 
    error: fetchError
  } = useTeamMember(memberId)

  // Update mutation with React Query
  const updateMutation = useUpdateTeamMember(memberId)

  // Set the form data when the member data is loaded
  useEffect(() => {
    if (member && !formData) {
      setFormData(teamMemberToFormData(member))
    }
  }, [member, formData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleImageChange = (value: string) => {
    setFormData(prev => prev ? { ...prev, avatar: value } : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    try {
      await updateMutation.mutateAsync(formData)
      toast.success("Team member updated successfully")
      setOpen(false)
    } catch (error) {
      console.error("Error updating team member:", error)
      toast.error("Failed to update team member")
    }
  }

  const isLoading = isFetching || updateMutation.isPending

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" size="content" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
          <SheetDescription>
            Update team member information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        {isFetching ? (
          <div className="py-4 space-y-6">
            <div className="mx-auto text-center">
              <Skeleton className="h-40 w-40 rounded-full mx-auto" />
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : isFetchError ? (
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-red-500 mb-2">Failed to load team member details</p>
            <p className="text-sm">{(fetchError as Error)?.message || "Unknown error"}</p>
          </div>
        ) : formData ? (
          <form onSubmit={handleSubmit} className="py-4 space-y-6">
            <div className="mx-auto">
              <ImageUpload 
                value={formData.avatar || ""}
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input
                  id="nationalId"
                  name="nationalId"
                  value={formData.nationalId || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  name="role"
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="ADMIN">Administrator</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Administrator</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  value={formData.status || "PENDING"}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="PENDING">Pending Approval</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  name="district"
                  value={formData.district || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  name="region"
                  value={formData.region || ""}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select
                name="availability"
                value={formData.availability || "PART_TIME"}
                onValueChange={(value) => handleSelectChange("availability", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="ON_CALL">On-call</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Input
                id="languages"
                name="languages"
                value={formData.languages || ""}
                onChange={handleInputChange}
                placeholder="English, Swahili, etc."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Interests</Label>
              <Textarea
                id="skills"
                name="skills"
                value={formData.skills || ""}
                onChange={handleInputChange}
                placeholder="List relevant skills and interests"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact || ""}
                onChange={handleInputChange}
                placeholder="Name and phone number"
                disabled={isLoading}
              />
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </SheetFooter>
          </form>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            Failed to load team member data
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 