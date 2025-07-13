import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryKey 
} from '@tanstack/react-query'
import { 
  getAllTeamMembers, 
  getTeamMemberById, 
  createTeamMember, 
  updateTeamMember, 
  deleteTeamMember,
  type TeamMember,
  type CreateTeamMemberData,
  type UpdateTeamMemberData
} from '@/lib/services/team-service'

// Query keys
export const teamKeys = {
  all: ['team-members'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: string) => [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
}

// Get all team members hook
export function useTeamMembers() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: getAllTeamMembers,
    refetchOnWindowFocus: true,
    staleTime: 0 // Always consider data stale so it refetches when needed
  })
}

// Get a single team member hook
export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => getTeamMemberById(id),
    enabled: !!id, // Only run the query if we have an ID
    staleTime: 0 // Always consider data stale
  })
}

// Create team member hook
export function useCreateTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateTeamMemberData) => createTeamMember(data),
    onSuccess: () => {
      // Invalidate and refetch the team members list query
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() })
      // Invalidate pending users queries in case new user needs approval
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['pending-users-count'] })
      // Invalidate dashboard stats as team counts may have changed
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Update team member hook
export function useUpdateTeamMember(id: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateTeamMemberData) => updateTeamMember(id, data),
    onSuccess: (updatedMember) => {
      // Update the cache for the specific team member
      queryClient.setQueryData(teamKeys.detail(id), updatedMember)
      // Invalidate and refetch the team members list query
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() })
      
      // Invalidate pending users queries since user status may have changed
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['pending-users-count'] })
      
      // Invalidate dashboard stats as team counts may have changed
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

// Delete team member hook
export function useDeleteTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: (_, id) => {
      // Remove the team member from the cache
      queryClient.removeQueries({ queryKey: teamKeys.detail(id) })
      // Invalidate and refetch the team members list query
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() })
      // Invalidate pending users queries in case deleted user was pending
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['pending-users-count'] })
      // Invalidate dashboard stats as team counts may have changed
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
} 