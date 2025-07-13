"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Basic task types
export interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  startDate: string | null
  endDate: string | null
  assignees: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }[]
  teams: {
    id: string
    name: string
    color: string | null
    icon: string | null
    members: {
      id: string
      user: {
        id: string
        firstName: string
        lastName: string
        avatar: string | null
      }
    }[]
  }[]
  projectId: string | null
  project: {
    id: string
    name: string
  } | null
  location: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  createdBy: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export interface TaskComment {
  id: string
  content: string
  taskId: string
  authorId: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  } | null
}

export interface TimeEntry {
  id: string
  taskId: string
  teamMemberId: string
  startTime: string
  endTime: string | null
  durationMinutes: number | null
  description: string | null
  createdAt: string
  updatedAt: string
  teamMember: {
    id: string
    firstName: string
    lastName: string
    avatar: string | null
  }
}

export interface CreateTaskData {
  title: string
  description?: string
  priority?: string
  status?: string
  assigneeIds?: string[] | string
  teamIds?: string[]
  projectId?: string
  startDate?: string | Date | null
  endDate?: string | Date | null
  location?: string
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface CreateTimeEntryData {
  startTime: string | Date
  endTime?: string | Date | null
  durationMinutes?: number | null
  description?: string
}

// Fetch all tasks
export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks")
      if (!response.ok) {
        throw new Error("Failed to fetch tasks")
      }
      return response.json() as Promise<Task[]>
    }
  })
}

// Fetch a specific task
export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: async () => {
      if (!taskId) return null
      
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch task")
      }
      return response.json() as Promise<Task>
    },
    enabled: !!taskId
  })
}

// Fetch task comments
export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "comments"],
    queryFn: async () => {
      if (!taskId) return []
      
      const response = await fetch(`/api/tasks/${taskId}/comments`)
      if (!response.ok) {
        throw new Error("Failed to fetch comments")
      }
      return response.json() as Promise<TaskComment[]>
    },
    enabled: !!taskId
  })
}

// Fetch task time entries
export function useTaskTimeEntries(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId, "time"],
    queryFn: async () => {
      if (!taskId) return []
      
      const response = await fetch(`/api/tasks/${taskId}/time`)
      if (!response.ok) {
        throw new Error("Failed to fetch time entries")
      }
      return response.json() as Promise<TimeEntry[]>
    },
    enabled: !!taskId
  })
}

// Create a new task
export function useAddTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      // Format date objects to ISO strings if they exist
      const formattedData = {
        ...data,
        startDate: data.startDate instanceof Date 
          ? data.startDate.toISOString() 
          : data.startDate,
        endDate: data.endDate instanceof Date 
          ? data.endDate.toISOString() 
          : data.endDate
      }
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create task")
      }
      
      return response.json() as Promise<Task>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Update an existing task
export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateTaskData) => {
      // Format date objects to ISO strings if they exist
      const formattedData = {
        ...data,
        startDate: data.startDate instanceof Date 
          ? data.startDate.toISOString() 
          : data.startDate,
        endDate: data.endDate instanceof Date 
          ? data.endDate.toISOString() 
          : data.endDate
      }
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update task")
      }
      
      return response.json() as Promise<Task>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete task")
      }
      
      return taskId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Add a comment to a task
export function useAddTaskComment(taskId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to add comment")
      }
      
      return response.json() as Promise<TaskComment>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "comments"] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
}

// Add a time entry to a task
export function useAddTaskTimeEntry(taskId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateTimeEntryData) => {
      // Format date objects to ISO strings if they exist
      const formattedData = {
        ...data,
        startTime: data.startTime instanceof Date 
          ? data.startTime.toISOString() 
          : data.startTime,
        endTime: data.endTime instanceof Date 
          ? data.endTime.toISOString() 
          : data.endTime
      }
      
      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to add time entry")
      }
      
      return response.json() as Promise<TimeEntry>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", taskId, "time"] })
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    }
  })
} 