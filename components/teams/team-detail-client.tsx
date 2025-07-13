"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Plus, 
  Users, 
  Settings, 
  MoreHorizontal,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTeam } from "@/lib/hooks/use-teams"
import { useUsers } from "@/lib/hooks/use-users"
import { useAddTeamMember, useRemoveTeamMember, useUpdateTeamMemberRole } from "@/lib/hooks/use-teams"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { toast } from "sonner"

interface TeamDetailClientProps {
  teamId: string
}

function getRoleIcon(role: string) {
  switch (role) {
    case "LEADER":
      return <Crown className="h-4 w-4 text-yellow-500" />
    case "COORDINATOR":
      return <Shield className="h-4 w-4 text-blue-500" />
    default:
      return <User className="h-4 w-4 text-gray-500" />
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case "LEADER":
      return <Badge className="bg-yellow-100 text-yellow-800">Leader</Badge>
    case "COORDINATOR":
      return <Badge className="bg-blue-100 text-blue-800">Coordinator</Badge>
    default:
      return <Badge variant="secondary">Member</Badge>
  }
}

export function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("MEMBER")
  
  // Fetch team details
  const { data: team, isLoading: isLoadingTeam } = useTeam(teamId, {
    includeMembers: true
  })
  
  // Fetch all system users for assignment
  const { data: allUsers = [], isLoading: isLoadingUsers } = useUsers()
  
  // Get team mutations
  const addMemberMutation = useAddTeamMember()
  const removeMemberMutation = useRemoveTeamMember()
  const updateRoleMutation = useUpdateTeamMemberRole()

  // Filter users who are not already in the team
  const availableUsers = allUsers.filter(user => 
    user.status === 'ACTIVE' && 
    !team?.members?.some(member => member.userId === user.id)
  )

  // Filter team members based on search
  const filteredMembers = team?.members?.filter(member =>
    `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user")
      return
    }

    try {
      await addMemberMutation.mutateAsync({
        userId: selectedUserId,
        teamId,
        role: selectedRole as "LEADER" | "COORDINATOR" | "MEMBER"
      })
      toast.success("Member added successfully")
      setShowAddMemberDialog(false)
      setSelectedUserId("")
      setSelectedRole("MEMBER")
    } catch (error: any) {
      toast.error(error.message || "Failed to add member")
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberMutation.mutateAsync({ userId, teamId })
      toast.success("Member removed successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member")
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRoleMutation.mutateAsync({ 
        userId, 
        teamId, 
        role: newRole as "LEADER" | "COORDINATOR" | "MEMBER"
      })
      toast.success("Role updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    }
  }

  if (isLoadingTeam) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
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

  if (!team) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Team Not Found</CardTitle>
            <CardDescription>
              The requested team could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/teams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
            <p className="text-muted-foreground">
              {team.description || "Manage team members and their roles"}
            </p>
          </div>
        </div>
        <Badge variant={team.isActive ? "default" : "secondary"}>
          {team.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.members?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaders</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.members?.filter(m => m.role === 'LEADER').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coordinators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.members?.filter(m => m.role === 'COORDINATOR').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members and their roles
              </CardDescription>
            </div>
            <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Add a system user to this team with a specific role.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select User</label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <SelectItem value="loading" disabled>Loading users...</SelectItem>
                        ) : availableUsers.length === 0 ? (
                          <SelectItem value="none" disabled>No available users</SelectItem>
                        ) : (
                          availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.email})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                        <SelectItem value="LEADER">Leader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddMember}
                    disabled={!selectedUserId || addMemberMutation.isPending}
                  >
                    {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Members List */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No members match your search" : "No members in this team yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar || ""} />
                      <AvatarFallback>
                        {member.user?.firstName?.[0] || ''}
                        {member.user?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(member.role)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.userId, "LEADER")}
                          disabled={member.role === "LEADER"}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Make Leader
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.userId, "COORDINATOR")}
                          disabled={member.role === "COORDINATOR"}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Make Coordinator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.userId, "MEMBER")}
                          disabled={member.role === "MEMBER"}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Make Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-600"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 