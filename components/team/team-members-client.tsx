"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ViewMemberSheet } from "@/components/team/view-member-sheet"
import { EditMemberSheet } from "@/components/team/edit-member-sheet"
import { DeleteMemberDialog } from "@/components/team/delete-member-dialog"
import { MoreHorizontalIcon, EyeIcon, PencilIcon, TrashIcon, RefreshCw } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTeamMembers } from "@/lib/hooks/use-team-members"
import { TeamMember } from "@/lib/services/team-service"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

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
    'PENDING': 'Pending Approval',
    'ACTIVE': 'Active',
    'INACTIVE': 'Inactive',
    'SUSPENDED': 'Suspended',
    'REJECTED': 'Rejected'
  }
  return statusMap[status] || status
}

export function TeamMembersClient() {
  // Fetch team members using React Query
  const { 
    data: teamMembers = [], 
    isLoading, 
    isError, 
    error,
    isRefetching,
    refetch 
  } = useTeamMembers()

  // Show loading state
  if (isLoading) {
    return <TeamMembersTableSkeleton />
  }

  // Show error state
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Error loading team members</p>
        <p className="text-sm text-muted-foreground">{(error as Error)?.message || "Unknown error"}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Team Members</h3>
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
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {teamMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  No team members found
                </td>
              </tr>
            ) : (
              teamMembers.map((member) => (
                <tr key={member.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage 
                          src={member.avatar || ""} 
                          alt={member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email} 
                        />
                        <AvatarFallback>
                          {member.firstName && member.lastName 
                            ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                            : member.name 
                            ? member.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')
                            : member.email.charAt(0).toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{formatRole(member.role)}</td>
                  <td className="p-4 align-middle">{member.district || 'N/A'}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : member.status === 'PENDING'
                        ? 'bg-blue-100 text-blue-800'
                        : member.status === 'INACTIVE' 
                        ? 'bg-gray-100 text-gray-800' 
                        : member.status === 'SUSPENDED'
                        ? 'bg-red-100 text-red-800'
                        : member.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatStatus(member.status)}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ViewMemberSheet 
                          memberId={member.id} 
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <EyeIcon className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                          } 
                        />
                        <EditMemberSheet
                          memberId={member.id}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <PencilIcon className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          }
                        />
                        <DeleteMemberDialog
                          memberId={member.id}
                          memberName={member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email}
                          trigger={
                            <DropdownMenuItem 
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <TrashIcon className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Skeleton loader for the table
function TeamMembersTableSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Location</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </td>
                <td className="p-4 align-middle"><Skeleton className="h-4 w-16" /></td>
                <td className="p-4 align-middle"><Skeleton className="h-4 w-12" /></td>
                <td className="p-4 align-middle"><Skeleton className="h-5 w-14 rounded-full" /></td>
                <td className="p-4 align-middle">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 