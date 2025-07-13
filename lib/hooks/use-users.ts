import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserRole, UserStatus } from '@/lib/generated/prisma'

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  jobTitle?: string | null;
  department?: string | null;
  phone?: string | null;
  district?: string | null;
  region?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
}

// Query keys for user-related queries
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Fetch all users
async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/admin/users')
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

// Fetch single user
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/admin/users/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  return response.json()
}

// Update user status (approve/reject/suspend)
async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
  const response = await fetch(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to update user status: ${error}`)
  }
  return response.json()
}

// Delete user
async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete user')
  }
}

// Main users hook
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Single user hook
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

// Update user status hook
export function useUpdateUserStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => 
      updateUserStatus(id, status),
    onSuccess: (updatedUser) => {
      // Update the cache for the specific user
      queryClient.setQueryData(userKeys.detail(updatedUser.id), updatedUser)
      // Invalidate and refetch the users list query
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      // Invalidate pending users queries since status may have changed
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['pending-users-count'] })
      // Invalidate team queries since user status affects team membership
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

// Delete user hook
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, id) => {
      // Remove the user from the cache
      queryClient.removeQueries({ queryKey: userKeys.detail(id) })
      // Invalidate and refetch the users list query
      queryClient.invalidateQueries({ queryKey: userKeys.lists() })
      // Invalidate pending users queries
      queryClient.invalidateQueries({ queryKey: ['pending-users'] })
      queryClient.invalidateQueries({ queryKey: ['pending-users-count'] })
      // Invalidate team queries
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
} 