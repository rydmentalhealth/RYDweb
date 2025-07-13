"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Team types
export interface Team {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  members?: TeamMember[]
  tasks?: TeamTask[]
  _count?: {
    members: number
    tasks: number
  }
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: string
  joinedAt: string
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar?: string | null
    status: string
    role: string
  }
}

export interface TeamTask {
  id: string
  taskId: string
  teamId: string
  assignedAt: string
  task?: {
    id: string
    title: string
    status: string
    priority: string
    startDate?: string | null
    endDate?: string | null
  }
}

export interface CreateTeamData {
  name: string
  description?: string
  color?: string
  icon?: string
  isActive?: boolean
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

export interface AddTeamMemberData {
  userId: string
  teamId: string
  role?: string
}

// Fetch all teams
export function useTeams(options?: {
  includeMembers?: boolean
  includeTasks?: boolean
  activeOnly?: boolean
}) {
  const { includeMembers = false, includeTasks = false, activeOnly = false } = options || {}
  
  return useQuery({
    queryKey: ["teams", { includeMembers, includeTasks, activeOnly }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (includeMembers) params.append('includeMembers', 'true')
      if (includeTasks) params.append('includeTasks', 'true')
      if (activeOnly) params.append('activeOnly', 'true')
      
      const response = await fetch(`/api/teams?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }
      return response.json() as Promise<Team[]>
    }
  })
}

// Fetch a specific team
export function useTeam(teamId: string, options?: {
  includeMembers?: boolean
  includeTasks?: boolean
}) {
  const { includeMembers = false, includeTasks = false } = options || {}
  
  return useQuery({
    queryKey: ["teams", teamId, { includeMembers, includeTasks }],
    queryFn: async () => {
      if (!teamId) return null
      
      const params = new URLSearchParams()
      if (includeMembers) params.append('includeMembers', 'true')
      if (includeTasks) params.append('includeTasks', 'true')
      
      const response = await fetch(`/api/teams/${teamId}?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch team")
      }
      return response.json() as Promise<Team>
    },
    enabled: !!teamId
  })
}

// Create a new team
export function useAddTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create team")
      }
      
      return response.json() as Promise<Team>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      toast.success("Team created successfully")
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Update an existing team
export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateTeamData) => {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update team")
      }
      
      return response.json() as Promise<Team>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] })
      toast.success("Team updated successfully")
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Delete a team
export function useDeleteTeam() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete team")
      }
      
      return teamId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      toast.success("Team deleted successfully")
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Add a member to a team
export function useAddTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: AddTeamMemberData) => {
      const response = await fetch(`/api/teams/${data.teamId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: data.userId, role: data.role }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to add team member")
      }
      
      return response.json() as Promise<TeamMember>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["teams", variables.teamId] })
      toast.success("Team member added successfully")
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Remove a member from a team
export function useRemoveTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, teamId }: { userId: string; teamId: string }) => {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to remove team member")
      }
      
      return { userId, teamId }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["teams", variables.teamId] })
      toast.success("Team member removed successfully")
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Update a team member's role
export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, teamId, role }: { userId: string; teamId: string; role: string }) => {
      const response = await fetch(`/api/teams/${teamId}/members/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update team member role")
      }
      
      return response.json() as Promise<TeamMember>
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] })
      queryClient.invalidateQueries({ queryKey: ["teams", variables.teamId] })
      toast.success("Team member role updated successfully")
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Get teams for a specific user
export function useUserTeams(userId: string) {
  return useQuery({
    queryKey: ["users", userId, "teams"],
    queryFn: async () => {
      if (!userId) return []
      
      const response = await fetch(`/api/users/${userId}/teams`)
      if (!response.ok) {
        throw new Error("Failed to fetch user teams")
      }
      return response.json() as Promise<Team[]>
    },
    enabled: !!userId
  })
} 