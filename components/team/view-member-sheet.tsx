"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { EyeIcon } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useTeamMember } from "@/lib/hooks/use-team-members"

interface ViewMemberSheetProps {
  memberId: string
  trigger: React.ReactNode
}

export function ViewMemberSheet({ memberId, trigger }: ViewMemberSheetProps) {
  const [open, setOpen] = useState(false)
  
  const { 
    data: member, 
    isLoading, 
    isError, 
    error 
  } = useTeamMember(memberId)

  const formatRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      'VOLUNTEER': 'Volunteer',
      'STAFF': 'Staff',
      'ADMIN': 'Administrator',
      'SUPER_ADMIN': 'Super Administrator'
    }
    return roleMap[role] || role
  }

  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending Approval',
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'SUSPENDED': 'Suspended',
      'REJECTED': 'Rejected'
    }
    return statusMap[status] || status
  }

  const formatAvailability = (availability: string): string => {
    const availabilityMap: Record<string, string> = {
      'FULL_TIME': 'Full-time',
      'PART_TIME': 'Part-time',
      'ON_CALL': 'On-call',
      'FLEXIBLE': 'Flexible'
    }
    return availabilityMap[availability] || availability
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" size="content" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Team Member Details</SheetTitle>
          <SheetDescription>
            View detailed information about this team member.
          </SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="text-center">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto mt-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-red-500 mb-2">Failed to load team member details</p>
            <p className="text-sm">{(error as Error)?.message || "Unknown error"}</p>
          </div>
        ) : member ? (
          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={member.avatar || ""} 
                  alt={member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email} 
                />
                <AvatarFallback className="text-xl">
                  {member.firstName && member.lastName 
                    ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                    : member.name 
                    ? member.name.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')
                    : member.email.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email}
                </h2>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Role" value={formatRole(member.role)} />
              <InfoItem 
                label="Status" 
                value={formatStatus(member.status)}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                }`}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Phone" value={member.phone || "Not provided"} />
              <InfoItem label="National ID" value={member.nationalId || "Not provided"} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="District" value={member.district || "Not provided"} />
              <InfoItem label="Region" value={member.region || "Not provided"} />
            </div>
            
            <InfoItem label="Availability" value={member.availability ? formatAvailability(member.availability) : "Not provided"} />
            
            <InfoItem label="Languages" value={member.languages || "Not provided"} />
            
            <InfoItem label="Skills & Interests" value={member.skills || "Not provided"} />
            
            <InfoItem label="Emergency Contact" value={member.emergencyContact || "Not provided"} />
            
            {member.createdAt && (
              <InfoItem label="Member Since" value={formatDate(member.createdAt)} />
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No member data found
          </div>
        )}
        
        <SheetFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

interface InfoItemProps {
  label: string
  value: string
  className?: string
}

function InfoItem({ label, value, className }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={className || "text-sm"}>{value}</p>
    </div>
  )
} 