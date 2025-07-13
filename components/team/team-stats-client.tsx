"use client"

import { 
  UserCircle2Icon, 
  CheckCircleIcon, 
  AlertCircleIcon 
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTeamMembers } from "@/lib/hooks/use-team-members"
import { Skeleton } from "@/components/ui/skeleton"

export function TeamStatsClient() {
  const { data: teamMembers = [], isLoading, isError } = useTeamMembers()
  
  if (isLoading) {
    return (
      <>
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
      </>
    )
  }
  
  if (isError) {
    return (
      <>
        <StatsCard title="Total Members" value="Error" icon={<UserCircle2Icon className="h-4 w-4" />} />
        <StatsCard title="Volunteers" value="Error" icon={<CheckCircleIcon className="h-4 w-4" />} />
        <StatsCard title="Staff" value="Error" icon={<AlertCircleIcon className="h-4 w-4" />} />
      </>
    )
  }
  
  // Calculate stats
  const totalMembers = teamMembers.length
  
  const volunteers = teamMembers.filter(member => 
    member.role === 'VOLUNTEER' || 
    member.role === 'MENTAL_HEALTH_CHAMPION' || 
    member.role === 'FIELD_OFFICER'
  ).length
  
  const staff = teamMembers.filter(member => 
    member.role === 'ADMIN' || 
    member.role === 'COUNSELOR'
  ).length

  return (
    <>
      <StatsCard title="Total Members" value={totalMembers.toString()} icon={<UserCircle2Icon className="h-4 w-4" />} />
      <StatsCard title="Volunteers" value={volunteers.toString()} icon={<CheckCircleIcon className="h-4 w-4" />} />
      <StatsCard title="Staff" value={staff.toString()} icon={<AlertCircleIcon className="h-4 w-4" />} />
    </>
  )
}

function StatsCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function StatsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium bg-muted animate-pulse w-20 h-4 rounded"></CardTitle>
        <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-muted animate-pulse w-10 h-8 rounded"></div>
      </CardContent>
    </Card>
  )
} 