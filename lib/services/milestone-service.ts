/**
 * Milestone Service
 * Handles all milestone related API calls
 */

export interface Milestone {
  id: string
  projectId: string
  title: string
  description?: string
  dueDate: string
  progress: number
  status: string
  responsibleUserId?: string
  createdAt: string
  updatedAt: string
  responsibleUser?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  subTasks?: Array<{
    id: string
    title: string
    description?: string
    isCompleted: boolean
    completedAt?: string
  }>
  attachments?: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize?: number
    uploadedAt: string
    uploadedBy: {
      id: string
      firstName: string
      lastName: string
    }
  }>
}

export interface CreateMilestoneData {
  title: string
  description?: string
  dueDate: string
  progress?: number
  status?: string
  responsibleUserId?: string
}

export interface UpdateMilestoneData {
  title?: string
  description?: string
  dueDate?: string
  progress?: number
  status?: string
  responsibleUserId?: string
}

// Get all milestones for a project
export async function getAllMilestones(projectId: string): Promise<Milestone[]> {
  const response = await fetch(`/api/projects/${projectId}/milestones`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch milestones')
  }

  return response.json()
}

// Get a specific milestone
export async function getMilestone(projectId: string, milestoneId: string): Promise<Milestone> {
  const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch milestone')
  }

  return response.json()
}

// Create a new milestone
export async function createMilestone(projectId: string, data: CreateMilestoneData): Promise<Milestone> {
  const response = await fetch(`/api/projects/${projectId}/milestones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create milestone')
  }

  return response.json()
}

// Update a milestone
export async function updateMilestone(
  projectId: string, 
  milestoneId: string, 
  data: UpdateMilestoneData
): Promise<Milestone> {
  const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update milestone')
  }

  return response.json()
}

// Delete a milestone
export async function deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete milestone')
  }
}