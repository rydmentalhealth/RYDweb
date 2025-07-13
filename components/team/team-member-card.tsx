"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CalendarIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react"

type TeamMember = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  role: string;
  status: string;
  district?: string | null;
  region?: string | null;
  availability?: string | null;
  languages?: string | null;
  skills?: string | null;
  emergencyContact?: string | null;
  jobTitle?: string | null;
  department?: string | null;
}

interface TeamMemberCardProps {
  member: TeamMember;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TeamMemberCard({ member, onEdit, onDelete }: TeamMemberCardProps) {
  // Format badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "secondary";
      case "SUSPENDED":
        return "destructive";
      case "PENDING":
        return "default";
      default:
        return "default";
    }
  };

  // Format role for display
  const formatRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      "VOLUNTEER": "Volunteer",
      "STAFF": "Staff",
      "ADMIN": "Administrator",
      "SUPER_ADMIN": "Super Administrator"
    }
    return roleMap[role] || role
  }

  // Format status for display
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      "ACTIVE": "Active",
      "INACTIVE": "Inactive",
      "SUSPENDED": "Suspended",
      "PENDING": "Pending Approval",
      "REJECTED": "Rejected"
    }
    return statusMap[status] || status
  }

  // Format availability for display
  const formatAvailability = (availability: string): string => {
    const availabilityMap: Record<string, string> = {
      "FULL_TIME": "Full-time",
      "PART_TIME": "Part-time",
      "ON_CALL": "On-call",
      "FLEXIBLE": "Flexible"
    }
    return availabilityMap[availability] || availability
  }

  // Get display name
  const displayName = member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown User'
  
  // Get initials for avatar
  const getInitials = () => {
    if (member.firstName && member.lastName) {
      return `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
    }
    if (member.name) {
      const nameParts = member.name.split(' ')
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
      }
      return member.name.charAt(0)
    }
    return member.email.charAt(0).toUpperCase()
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="relative pb-0">
        <div className="absolute right-4 top-4">
          <Badge variant={getBadgeVariant(member.status)}>
            {formatStatus(member.status)}
          </Badge>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-2">
            <AvatarImage src={member.avatar || ""} alt={displayName} />
            <AvatarFallback className="text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-center">{displayName}</CardTitle>
          <CardDescription className="text-center">
            {formatRole(member.role)}
            {member.jobTitle && ` • ${member.jobTitle}`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="mt-4 space-y-4">
        <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <span>{member.email}</span>
            </div>
          
          {member.phone && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />
              <span>{member.phone}</span>
            </div>
          )}

          {member.department && (
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>Department: {member.department}</span>
            </div>
          )}

          {(member.district || member.region) && (
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
              <span>
                {member.district ? `${member.district}, ${member.region}` : member.region}
              </span>
            </div>
          )}

          {member.availability && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{formatAvailability(member.availability)}</span>
            </div>
          )}

          {member.languages && (
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
              <span>{member.languages}</span>
            </div>
          )}

          {member.nationalId && (
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span>ID: {member.nationalId}</span>
            </div>
          )}
        </div>

        {member.skills && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Skills & Interests</h4>
            <p className="text-sm text-muted-foreground">{member.skills}</p>
          </div>
        )}

        {member.emergencyContact && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Emergency Contact</h4>
            <p className="text-sm text-muted-foreground">{member.emergencyContact}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>Edit</Button>
        <Button variant="destructive" onClick={onDelete}>Delete</Button>
      </CardFooter>
    </Card>
  )
} 