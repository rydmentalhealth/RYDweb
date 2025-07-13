import { useQuery } from '@tanstack/react-query'

interface PendingUsersResponse {
  count: number
  users: Array<{
    id: string
    email: string
    firstName?: string
    lastName?: string
    createdAt: string
  }>
}

// Hook to fetch pending users count
export function usePendingUsers() {
  return useQuery<PendingUsersResponse>({
    queryKey: ['pending-users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-users')
      if (!response.ok) {
        throw new Error('Failed to fetch pending users')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Hook to fetch just the count (lighter weight)
export function usePendingUsersCount() {
  return useQuery<{ count: number }>({
    queryKey: ['pending-users-count'],
    queryFn: async () => {
      const response = await fetch('/api/admin/pending-users-count')
      if (!response.ok) {
        throw new Error('Failed to fetch pending users count')
      }
      return response.json()
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })
} 