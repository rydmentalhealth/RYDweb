import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  tasksInProgress: number
  
  totalTeamMembers: number
  activeTeamMembers: number
  pendingApprovals: number
  
  totalProjects: number
  activeProjects: number
  completedProjects: number
  
  // User-specific fields (for non-admin users)
  myTeams?: number
  myActiveTeams?: number
  
  recentActivity: {
    tasksCompleted: number
    newRegistrations: number
    totalHours: number
  }
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  })
} 