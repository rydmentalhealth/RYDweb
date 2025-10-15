import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getAllProgressUpdates, 
  createProgressUpdate, 
  updateProgressUpdate, 
  deleteProgressUpdate 
} from '@/lib/services/progress-update-service'

// Get all progress updates for a project
export function useProgressUpdates(projectId: string, filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['progress-updates', projectId, filters],
    queryFn: () => getAllProgressUpdates(projectId, filters),
    enabled: !!projectId,
  })
}

// Get a specific progress update
export function useProgressUpdate(projectId: string, updateId: string) {
  return useQuery({
    queryKey: ['progress-updates', projectId, updateId],
    queryFn: () => getAllProgressUpdates(projectId, { id: updateId }),
    enabled: !!projectId && !!updateId,
  })
}

// Create a new progress update
export function useCreateProgressUpdate(projectId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => createProgressUpdate(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-updates', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update a progress update
export function useUpdateProgressUpdate(projectId: string, updateId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: any) => updateProgressUpdate(projectId, updateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-updates', projectId] })
      queryClient.invalidateQueries({ queryKey: ['progress-updates', projectId, updateId] })
    },
  })
}

// Delete a progress update
export function useDeleteProgressUpdate(projectId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (updateId: string) => deleteProgressUpdate(projectId, updateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-updates', projectId] })
    },
  })
}

// Approve a progress update
export function useApproveProgressUpdate(projectId: string, updateId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { isApproved: boolean; comments?: string }) => 
      updateProgressUpdate(projectId, updateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress-updates', projectId] })
      queryClient.invalidateQueries({ queryKey: ['progress-updates', projectId, updateId] })
    },
  })
}