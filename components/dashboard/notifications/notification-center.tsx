"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  Info, 
  UserPlus, 
  DollarSign, 
  FileText,
  MessageSquare,
  Calendar
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: 'task' | 'approval' | 'payment' | 'announcement' | 'system' | 'deadline'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionUrl?: string
  metadata?: Record<string, any>
}

// Mock notifications - replace with real API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Update client counseling records" in Mental Health Services project.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/tasks'
  },
  {
    id: '2',
    type: 'approval',
    title: 'Expense Report Approved',
    message: 'Your expense report for UGX 150,000 has been approved and processed.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
    priority: 'medium',
    actionUrl: '/dashboard/finance'
  },
  {
    id: '3',
    type: 'announcement',
    title: 'Monthly Team Meeting',
    message: 'Don\'t forget about the monthly team meeting scheduled for Friday at 2:00 PM.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    priority: 'medium',
    actionUrl: '/dashboard/calendar'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Stipend Payment Processed',
    message: 'Your monthly stipend of UGX 850,000 has been processed and will be available in your account.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    priority: 'low',
    actionUrl: '/dashboard/finance'
  },
  {
    id: '5',
    type: 'deadline',
    title: 'Report Deadline Approaching',
    message: 'Your monthly department report is due in 2 days. Please submit before the deadline.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    read: false,
    priority: 'critical',
    actionUrl: '/dashboard/reports'
  }
]

export function NotificationCenter() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return <CheckCheck className="h-4 w-4" />
      case 'approval':
        return <Check className="h-4 w-4" />
      case 'payment':
        return <DollarSign className="h-4 w-4" />
      case 'announcement':
        return <MessageSquare className="h-4 w-4" />
      case 'system':
        return <Info className="h-4 w-4" />
      case 'deadline':
        return <Calendar className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    )
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  // Simulate real-time notifications (in a real app, this would come from WebSocket or polling)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving a new notification occasionally
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: 'system',
          title: 'System Update',
          message: 'A new system update is available.',
          timestamp: new Date(),
          read: false,
          priority: 'low'
        }
        setNotifications(prev => [newNotification, ...prev])
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          </div>
        </div>
        <Separator />
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.read && "bg-blue-50 border-blue-200",
                    notification.read && "bg-background"
                  )}
                  onClick={() => {
                    markAsRead(notification.id)
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl
                    }
                  }}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border",
                    getPriorityColor(notification.priority)
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {notification.priority === 'critical' && (
                      <div className="flex items-center gap-1 mt-2">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">Urgent</span>
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" asChild>
                <a href="/dashboard/notifications">View All Notifications</a>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}