import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { 
  createNewMemberAnnouncement,
  createAchievementAnnouncement,
  createProjectUpdateAnnouncement
} from '@/lib/services/communication'

/**
 * Hook to integrate communication system with other modules
 */
export function useCommunicationIntegration() {
  const queryClient = useQueryClient()

  // Function to trigger new member announcement
  const announceNewMember = async (userId: string) => {
    try {
      const result = await createNewMemberAnnouncement(userId)
      if (result.success) {
        // Refresh announcements
        queryClient.invalidateQueries({ queryKey: ['communication', 'announcements'] })
      }
      return result
    } catch (error) {
      console.error('Error creating new member announcement:', error)
      return { success: false, error: 'Failed to create announcement' }
    }
  }

  // Function to trigger achievement announcement
  const announceAchievement = async (userId: string, badgeId: string, reason?: string) => {
    try {
      const result = await createAchievementAnnouncement(userId, badgeId, reason)
      if (result.success) {
        // Refresh announcements
        queryClient.invalidateQueries({ queryKey: ['communication', 'announcements'] })
      }
      return result
    } catch (error) {
      console.error('Error creating achievement announcement:', error)
      return { success: false, error: 'Failed to create announcement' }
    }
  }

  // Function to trigger project update announcement
  const announceProjectUpdate = async (projectId: string, updateType: 'STARTED' | 'COMPLETED' | 'MILESTONE') => {
    try {
      const result = await createProjectUpdateAnnouncement(projectId, updateType)
      if (result.success) {
        // Refresh announcements
        queryClient.invalidateQueries({ queryKey: ['communication', 'announcements'] })
      }
      return result
    } catch (error) {
      console.error('Error creating project update announcement:', error)
      return { success: false, error: 'Failed to create announcement' }
    }
  }

  return {
    announceNewMember,
    announceAchievement,
    announceProjectUpdate,
  }
}

/**
 * Hook for real-time communication updates
 */
export function useRealtimeCommunication() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      // Refresh notifications every 30 seconds
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      
      // Refresh channels every minute for unread counts
      queryClient.invalidateQueries({ queryKey: ['communication', 'channels'] })
    }, 30000)

    return () => clearInterval(interval)
  }, [queryClient])

  // Function to mark channel as read
  const markChannelAsRead = (channelId: string) => {
    // Optimistically update the cache
    queryClient.setQueryData(['communication', 'channels'], (oldData: any) => {
      if (!oldData?.channels) return oldData
      
      return {
        ...oldData,
        channels: oldData.channels.map((channel: any) =>
          channel.id === channelId 
            ? { ...channel, unreadCount: 0 }
            : channel
        )
      }
    })
  }

  return {
    markChannelAsRead,
  }
}