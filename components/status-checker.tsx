"use client"

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface StatusCheckerProps {
  /** Polling interval in milliseconds (default: 30 seconds) */
  interval?: number
  /** Whether to show notifications when status changes */
  showNotifications?: boolean
  /** Callback when status changes to ACTIVE */
  onApproved?: () => void
}

export function StatusChecker({ 
  interval = 30000, // 30 seconds
  showNotifications = true,
  onApproved 
}: StatusCheckerProps) {
  const { data: session, update } = useSession()
  const router = useRouter()
  
  const checkStatus = useCallback(async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch('/api/user/status')
      
      if (!response.ok) {
        console.error('Failed to check user status')
        return
      }
      
      const data = await response.json()
      
      // If status has changed to ACTIVE, redirect to dashboard
      if (data.status === 'ACTIVE' && session.user.status !== 'ACTIVE') {
        if (showNotifications) {
          toast.success('🎉 Your account has been approved! Redirecting to dashboard...')
        }
        
        // Update the session with new status
        await update({
          ...session,
          user: {
            ...session.user,
            status: data.status,
            role: data.role
          }
        })
        
        // Call the callback if provided
        if (onApproved) {
          onApproved()
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      }
      // Handle other status changes
      else if (data.status === 'REJECTED' && session.user.status !== 'REJECTED') {
        if (showNotifications) {
          toast.error('Your account application has been rejected. Please contact support.')
        }
        
        // Update the session
        await update({
          ...session,
          user: {
            ...session.user,
            status: data.status
          }
        })
      }
      else if (data.status === 'SUSPENDED' && session.user.status !== 'SUSPENDED') {
        if (showNotifications) {
          toast.error('Your account has been suspended. Please contact support.')
        }
        
        // Update the session
        await update({
          ...session,
          user: {
            ...session.user,
            status: data.status
          }
        })
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    }
  }, [session, update, router, showNotifications, onApproved])
  
  useEffect(() => {
    // Only run for pending users
    if (!session?.user || session.user.status === 'ACTIVE') {
      return
    }
    
    // Check immediately
    checkStatus()
    
    // Set up polling
    const intervalId = setInterval(checkStatus, interval)
    
    // Cleanup
    return () => {
      clearInterval(intervalId)
    }
  }, [checkStatus, interval, session?.user?.status])
  
  // Also check when the tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user?.status !== 'ACTIVE') {
        checkStatus()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkStatus, session?.user?.status])
  
  // This component doesn't render anything
  return null
} 