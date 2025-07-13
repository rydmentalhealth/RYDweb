"use client"

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface UserStatusResponse {
  status: string
  role: string
  hasStatusChanged: boolean
}

/**
 * Hook to fetch and monitor user status from the database
 */
export function useUserStatus() {
  const { data: session } = useSession()
  
  return useQuery<UserStatusResponse>({
    queryKey: ['user-status', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/user/status')
      
      if (!response.ok) {
        throw new Error('Failed to fetch user status')
      }
      
      return response.json()
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch when component mounts
  })
}

/**
 * Hook to check if user's status has changed since last session
 */
export function useStatusChange() {
  const { data: session } = useSession()
  const { data: statusData } = useUserStatus()
  
  const hasStatusChanged = statusData?.hasStatusChanged || false
  const currentStatus = statusData?.status
  const sessionStatus = session?.user?.status
  
  return {
    hasStatusChanged,
    currentStatus,
    sessionStatus,
    isApproved: currentStatus === 'ACTIVE' && sessionStatus !== 'ACTIVE',
    isRejected: currentStatus === 'REJECTED' && sessionStatus !== 'REJECTED',
    isSuspended: currentStatus === 'SUSPENDED' && sessionStatus !== 'SUSPENDED',
  }
} 