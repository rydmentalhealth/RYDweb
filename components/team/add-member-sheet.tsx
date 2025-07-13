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
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useCreateTeamMember } from "@/lib/hooks/use-team-members"
import { CreateTeamMemberData } from "@/lib/services/team-service"

export function AddMemberSheet() {
  const [open, setOpen] = useState(false)
  
  const [formData, setFormData] = useState<CreateTeamMemberData>({
    firstName: "",
    lastName: "",
    email: "",
    avatar: "",
    phone: "",
    nationalId: "",
    role: "VOLUNTEER",
    status: "ACTIVE",
    district: "",
    region: "",
    availability: "PART_TIME",
    languages: "",
    skills: "",
    emergencyContact: "",
  })

  // Use the React Query mutation hook
  const createMutation = useCreateTeamMember()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, avatar: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      await createMutation.mutateAsync(formData)
      toast.success("Team member added successfully")
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
        phone: "",
        nationalId: "",
        role: "VOLUNTEER",
        status: "ACTIVE",
        district: "",
        region: "",
        availability: "PART_TIME",
        languages: "",
        skills: "",
        emergencyContact: "",
      })
      
      setOpen(false)
    } catch (error) {
      console.error("Error adding team member:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add team member")
    }
  }

  const isLoading = createMutation.isPending

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </SheetTrigger>
      <SheetContent side="right" size="content" className="overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Add New Team Member</SheetTitle>
            <SheetDescription>
              Add a new volunteer or staff member to your team.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="mx-auto">
              <ImageUpload 
                value={formData.avatar} 
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="First name" 
                  required 
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Last name" 
                  required 
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                required 
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  placeholder="Phone number" 
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nationalId">National ID</Label>
                <Input 
                  id="nationalId" 
                  placeholder="National ID or volunteer ID" 
                  value={formData.nationalId}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleSelectChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MENTAL_HEALTH_CHAMPION">Mental Health Champion</SelectItem>
                    <SelectItem value="FIELD_OFFICER">Field Officer</SelectItem>
                    <SelectItem value="COUNSELOR">Counselor</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="VOLUNTEER">General Volunteer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="district">District</Label>
                <Input 
                  id="district" 
                  placeholder="District" 
                  value={formData.district}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="region">Region</Label>
                <Input 
                  id="region" 
                  placeholder="Region" 
                  value={formData.region}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="availability">Availability</Label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => handleSelectChange("availability", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="availability">
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full-time</SelectItem>
                    <SelectItem value="PART_TIME">Part-time</SelectItem>
                    <SelectItem value="ON_CALL">On-call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="languages">Languages</Label>
                <Input 
                  id="languages" 
                  placeholder="Languages spoken" 
                  value={formData.languages}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills & Interests</Label>
              <Textarea 
                id="skills" 
                placeholder="Skills and interests" 
                value={formData.skills}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input 
                id="emergencyContact" 
                placeholder="Emergency contact information" 
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Member"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 