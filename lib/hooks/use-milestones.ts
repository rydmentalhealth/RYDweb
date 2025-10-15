import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getAllMilestones, 
  getMilestone, 
  createMilestone, 
  updateMilestone, 
  deleteMilestone 
} from '@/lib/services/milestone-service'

// Get all milestones for a project
export function useMilestones(projectId: string) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => getAllMilestones(projectId),
    enabled: !!projectId,
  })
}

// Get a specific milestone
export function useMilestone(projectId: string, milestoneId: string) {
  return useQuery({
    queryKey: ['milestones', projectId, milestoneId],
    queryFn: () => getMilestone(projectId, milestoneId),
    enabled: !!projectId && !!milestoneId,
  })
}

// Create a new milestone
export function useCreateMilestone(projectId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => createMilestone(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update a milestone
export function useUpdateMilestone(projectId: string, milestoneId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => updateMilestone(projectId, milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, milestoneId] })
    },
  })
}

// Delete a milestone
export function useDeleteMilestone(projectId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (milestoneId: string) => deleteMilestone(projectId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
    },
  })
}

// Update milestone progress
export function useUpdateMilestoneProgress(projectId: string, milestoneId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (progress: number) => updateMilestone(projectId, milestoneId, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, milestoneId] })
    },
  })
}

// Update milestone status
export function useUpdateMilestoneStatus(projectId: string, milestoneId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (status: string) => updateMilestone(projectId, milestoneId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] })
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId, milestoneId] })
    },
  })
}