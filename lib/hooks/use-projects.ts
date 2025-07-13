"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Basic project types
export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  tasks?: ProjectTask[]
  members?: ProjectMember[]
}

export interface ProjectTask {
  id: string
  title: string
  status: string
  priority: string
}

export interface ProjectMember {
  id: string
  role: string
  member: {
    id: string
    firstName: string
    lastName: string
    avatar?: string | null
  }
}

export interface CreateProjectData {
  name: string
  description?: string
  status?: string
  startDate?: string | null
  endDate?: string | null
  members?: string[]
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

// Fetch all projects
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      return response.json() as Promise<Project[]>
    }
  })
}

// Fetch a specific project
export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      if (!projectId) return null
      
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch project")
      }
      return response.json() as Promise<Project>
    },
    enabled: !!projectId
  })
}

// Create a new project
export function useAddProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create project")
      }
      
      return response.json() as Promise<Project>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Update an existing project
export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateProjectData) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update project")
      }
      
      return response.json() as Promise<Project>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Delete a project
export function useDeleteProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete project")
      }
      
      return projectId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
} 