"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ViewMemberSheet } from "@/components/team/view-member-sheet"
import { EditMemberSheet } from "@/components/team/edit-member-sheet"
import { DeleteMemberDialog } from "@/components/team/delete-member-dialog"
import { 
  MoreHorizontalIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  RefreshCw,
  CheckIcon,
  XIcon,
  BanIcon,
  UserCheckIcon,
  ClockIcon,
  AlertTriangleIcon
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUsers, useUpdateUserStatus, useDeleteUser, type User } from "@/lib/hooks/use-users"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { UserStatus } from "@/lib/generated/prisma"

// Helper functions for formatting
function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'VOLUNTEER': 'Volunteer',
    'STAFF': 'Staff',
    'ADMIN': 'Administrator',
    'SUPER_ADMIN': 'Super Administrator'
  }
  return roleMap[role] || role
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'SUSPENDED': 'Suspended',
    'PENDING': 'Pending Approval',
    'REJECTED': 'Rejected'
  }
  return statusMap[status] || status
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'ACTIVE':
      return 'default' // Green
    case 'PENDING':
      return 'secondary' // Blue
    case 'INACTIVE':
      return 'outline' // Gray
    case 'SUSPENDED':
    case 'REJECTED':
      return 'destructive' // Red
    default:
      return 'outline'
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <UserCheckIcon className="h-3 w-3" />
    case 'PENDING':
      return <ClockIcon className="h-3 w-3" />
    case 'SUSPENDED':
    case 'REJECTED':
      return <AlertTriangleIcon className="h-3 w-3" />
    default:
      return <ClockIcon className="h-3 w-3" />
  }
}

export function UsersClient() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Fetch users using React Query
  const { 
    data: users = [], 
    isLoading, 
    isError, 
    error,
    isRefetching,
    refetch 
  } = useUsers()
  
  // Mutations for status updates and deletion
  const updateUserStatus = useUpdateUserStatus()
  const deleteUser = useDeleteUser()
  
  // Filter users - separate suspended users from main table
  const regularUsers = users.filter((user: User) => {
    // Always exclude suspended users from main table
    if (user.status === 'SUSPENDED') return false
    
    if (statusFilter === "all") return true
    return user.status === statusFilter
  })
  
  // Get suspended users separately
  const suspendedUsers = users.filter((user: User) => user.status === 'SUSPENDED')
  
  // Handle status update
  const handleStatusUpdate = async (userId: string, newStatus: UserStatus, currentStatus: string) => {
    const statusNames: Record<UserStatus, string> = {
      'ACTIVE': 'approved',
      'REJECTED': 'rejected',
      'SUSPENDED': 'suspended',
      'INACTIVE': 'deactivated',
      'PENDING': 'set as pending'
    }
    
    const actionName = statusNames[newStatus] || newStatus.toLowerCase()
    
    try {
      await updateUserStatus.mutateAsync({ id: userId, status: newStatus })
      toast.success(`User has been ${actionName} successfully`)
    } catch (error) {
      toast.error(`Failed to ${actionName.replace('ed', '')} user: ${(error as Error).message}`)
    }
  }
  
  // Handle user deletion
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteUser.mutateAsync(userId)
        toast.success('User deleted successfully')
      } catch (error) {
        toast.error(`Failed to delete user: ${(error as Error).message}`)
      }
    }
  }

  // Show loading state
  if (isLoading) {
    return <UsersTableSkeleton />
  }

  // Show error state
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Error loading users</p>
        <p className="text-sm text-muted-foreground">{(error as Error)?.message || "Unknown error"}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  const renderUserRow = (user: User, showQuickActions = true) => {
    const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    
    return (
      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
        <td className="p-4 align-middle">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={user.avatar || ""} 
                alt={displayName} 
              />
              <AvatarFallback>
                {user.firstName && user.lastName 
                  ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                  : user.name 
                  ? user.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')
                  : user.email.charAt(0).toUpperCase()
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{displayName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="p-4 align-middle">
          <Badge variant="outline">{formatRole(user.role)}</Badge>
        </td>
        <td className="p-4 align-middle">
          <Badge variant={getStatusBadgeVariant(user.status)} className="gap-1">
            {getStatusIcon(user.status)}
            {formatStatus(user.status)}
          </Badge>
        </td>
        <td className="p-4 align-middle">{user.district || 'N/A'}</td>
        <td className="p-4 align-middle">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="p-4 align-middle text-right">
          <div className="flex items-center justify-end gap-2">
            {/* Quick Action Buttons - only for regular users table */}
            {showQuickActions && (
              <>
                {/* Quick Actions for Pending Users */}
                {user.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => handleStatusUpdate(user.id, 'ACTIVE' as UserStatus, user.status)}
                      disabled={updateUserStatus.isPending}
                    >
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleStatusUpdate(user.id, 'REJECTED' as UserStatus, user.status)}
                      disabled={updateUserStatus.isPending}
                    >
                      <XIcon className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
              </>
            )}
            
            {/* Quick Actions for Suspended Users - only in suspended table */}
            {!showQuickActions && user.status === 'SUSPENDED' && (
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => handleStatusUpdate(user.id, 'ACTIVE' as UserStatus, user.status)}
                disabled={updateUserStatus.isPending}
              >
                <UserCheckIcon className="h-3 w-3 mr-1" />
                Reactivate
              </Button>
            )}
            
            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ViewMemberSheet 
                  memberId={user.id} 
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View details
                    </DropdownMenuItem>
                  } 
                />
                <EditMemberSheet
                  memberId={user.id}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                  }
                />
                {/* Suspend action - only for active users */}
                {user.status === 'ACTIVE' && (
                  <DropdownMenuItem 
                    className="text-orange-600"
                    onClick={() => handleStatusUpdate(user.id, 'SUSPENDED' as UserStatus, user.status)}
                  >
                    <BanIcon className="mr-2 h-4 w-4" />
                    Suspend User
                  </DropdownMenuItem>
                )}
                {/* Reactivate action - only for suspended users */}
                {user.status === 'SUSPENDED' && (
                  <DropdownMenuItem 
                    className="text-green-600"
                    onClick={() => handleStatusUpdate(user.id, 'ACTIVE' as UserStatus, user.status)}
                  >
                    <UserCheckIcon className="mr-2 h-4 w-4" />
                    Reactivate User
                  </DropdownMenuItem>
                )}
                <DeleteMemberDialog
                  memberId={user.id}
                  memberName={displayName}
                  trigger={
                    <DropdownMenuItem 
                      className="text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter and Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">User Management</h3>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => refetch()} 
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Users Table */}
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {regularUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {statusFilter === "all" ? "No users found" : `No ${statusFilter.toLowerCase()} users found`}
                  </td>
                </tr>
              ) : (
                regularUsers.map((user: User) => renderUserRow(user, true))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary for main table */}
      <div className="text-sm text-muted-foreground">
        Showing {regularUsers.length} of {users.length - suspendedUsers.length} users
        {statusFilter !== "all" && ` (filtered by ${statusFilter.toLowerCase()})`}
      </div>

      {/* Suspended Users Table */}
      {suspendedUsers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-orange-600">Suspended Users</h3>
            <Badge variant="destructive" className="gap-1">
              <AlertTriangleIcon className="h-3 w-3" />
              {suspendedUsers.length}
            </Badge>
          </div>
          
          <div className="rounded-md border border-orange-200 bg-orange-50/30">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {suspendedUsers.map((user: User) => renderUserRow(user, false))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Summary for suspended table */}
          <div className="text-sm text-orange-600">
            {suspendedUsers.length} suspended user{suspendedUsers.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton loader for the table
function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-12" /></td>
                  <td className="p-4 align-middle"><Skeleton className="h-4 w-16" /></td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 