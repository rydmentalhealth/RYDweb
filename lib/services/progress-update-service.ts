/**
 * Progress Update Service
 * Handles all progress update related API calls
 */

export interface ProgressUpdate {
  id: string
  projectId: string
  userId: string
  taskActivity: string
  progressPercentage: number
  challenges?: string
  nextPlan?: string
  attachment?: string
  isApproved: boolean
  approvedAt?: string
  comments?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  approvedBy?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

export interface CreateProgressUpdateData {
  taskActivity: string
  progressPercentage: number
  challenges?: string
  nextPlan?: string
  attachment?: string
}

export interface UpdateProgressUpdateData {
  taskActivity?: string
  progressPercentage?: number
  challenges?: string
  nextPlan?: string
  attachment?: string
  isApproved?: boolean
  comments?: string
}

// Get all progress updates for a project
export async function getAllProgressUpdates(
  projectId: string, 
  filters?: Record<string, any>
): Promise<ProgressUpdate[]> {
  let url = `/api/projects/${projectId}/progress`
  
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })
    url += `?${params.toString()}`
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch progress updates')
  }

  return response.json()
}

// Get a specific progress update
export async function getProgressUpdate(
  projectId: string, 
  updateId: string
): Promise<ProgressUpdate> {
  const response = await fetch(`/api/projects/${projectId}/progress/${updateId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch progress update')
  }

  return response.json()
}

// Create a new progress update
export async function createProgressUpdate(
  projectId: string, 
  data: CreateProgressUpdateData
): Promise<ProgressUpdate> {
  const response = await fetch(`/api/projects/${projectId}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create progress update')
  }

  return response.json()
}

// Update a progress update
export async function updateProgressUpdate(
  projectId: string, 
  updateId: string, 
  data: UpdateProgressUpdateData
): Promise<ProgressUpdate> {
  const response = await fetch(`/api/projects/${projectId}/progress/${updateId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update progress update')
  }

  return response.json()
}

// Delete a progress update
export async function deleteProgressUpdate(
  projectId: string, 
  updateId: string
): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/progress/${updateId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete progress update')
  }
}

// Approve a progress update
export async function approveProgressUpdate(
  projectId: string, 
  updateId: string, 
  comments?: string
): Promise<ProgressUpdate> {
  return updateProgressUpdate(projectId, updateId, {
    isApproved: true,
    comments
  })
}

// Reject a progress update
export async function rejectProgressUpdate(
  projectId: string, 
  updateId: string, 
  comments?: string
): Promise<ProgressUpdate> {
  return updateProgressUpdate(projectId, updateId, {
    isApproved: false,
    comments
  })
}