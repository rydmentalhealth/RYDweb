"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Users,
  Plus,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProjectTeamProps {
  project: {
    id: string
    name: string
    members?: Array<{
      id: string
      firstName: string
      lastName: string
      avatar?: string
      role?: string
      department?: string
      email?: string
      phone?: string
      joinedAt?: string
    }>
    projectLead?: {
      id: string
      firstName: string
      lastName: string
      avatar?: string
    }
  }
}

export function ProjectTeam({ project }: ProjectTeamProps) {
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const handleAddMember = async (memberId: string, role: string) => {
    try {
      // TODO: Implement API call to add member to project
      console.log('Adding member to project:', memberId, role)
      toast.success("Member added to project successfully")
      setIsAddingMember(false)
    } catch (error) {
      toast.error("Failed to add member to project")
      console.error("Error adding member:", error)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member from the project?")) return
    
    try {
      // TODO: Implement API call to remove member from project
      console.log('Removing member from project:', memberId)
      toast.success("Member removed from project successfully")
    } catch (error) {
      toast.error("Failed to remove member from project")
      console.error("Error removing member:", error)
    }
  }

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      // TODO: Implement API call to change member role
      console.log('Changing member role:', memberId, newRole)
      toast.success("Member role updated successfully")
    } catch (error) {
      toast.error("Failed to update member role")
      console.error("Error updating member role:", error)
    }
  }

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'LEADER':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'COORDINATOR':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'MEMBER':
        return <User className="h-4 w-4 text-gray-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'LEADER':
        return 'bg-yellow-100 text-yellow-800'
      case 'COORDINATOR':
        return 'bg-blue-100 text-blue-800'
      case 'MEMBER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role?: string) => {
    switch (role) {
      case 'LEADER':
        return 'Project Lead'
      case 'COORDINATOR':
        return 'Coordinator'
      case 'MEMBER':
        return 'Member'
      default:
        return 'Member'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Team</h3>
          <p className="text-sm text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        
        <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a new member to this project
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Member</label>
                <Select onValueChange={(value) => setSelectedMember(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Add team members from organization */}
                    <SelectItem value="user1">John Doe - IT Department</SelectItem>
                    <SelectItem value="user2">Jane Smith - Outreach</SelectItem>
                    <SelectItem value="user3">Mike Johnson - Therapy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select onValueChange={(role) => selectedMember && handleAddMember(selectedMember, role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                    <SelectItem value="LEADER">Project Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Lead */}
      {project.projectLead && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Project Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={project.projectLead.avatar} alt={`${project.projectLead.firstName} ${project.projectLead.lastName}`} />
                <AvatarFallback>
                  {project.projectLead.firstName?.[0]}{project.projectLead.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{project.projectLead.firstName} {project.projectLead.lastName}</h4>
                <p className="text-sm text-muted-foreground">Project Lead</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Crown className="h-3 w-3 mr-1" />
                Lead
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <div className="space-y-4">
        {project.members && project.members.length > 0 ? (
          project.members.map((member) => (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                      <AvatarFallback>
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {member.department && (
                          <span>{member.department}</span>
                        )}
                        {member.joinedAt && (
                          <>
                            <span>•</span>
                            <span>Joined {format(parseISO(member.joinedAt), 'MMM d, yyyy')}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {member.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <Badge variant="outline" className={getRoleColor(member.role)}>
                        {getRoleText(member.role)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Select 
                        value={member.role || 'MEMBER'} 
                        onValueChange={(newRole) => handleChangeRole(member.id, newRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                          <SelectItem value="LEADER">Project Lead</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No team members assigned</p>
                <p className="text-sm text-muted-foreground">Add team members to collaborate on this project</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Team Stats */}
      {project.members && project.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{project.members.length}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {project.members.filter(m => m.role === 'LEADER').length}
                </p>
                <p className="text-sm text-muted-foreground">Project Leads</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {project.members.filter(m => m.role === 'COORDINATOR').length}
                </p>
                <p className="text-sm text-muted-foreground">Coordinators</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {project.members.filter(m => m.role === 'MEMBER' || !m.role).length}
                </p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}