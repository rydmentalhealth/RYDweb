"use client"

import { 
  UsersIcon, 
  ShieldIcon, 
  UserCheckIcon, 
  ClockIcon 
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTeams } from "@/lib/hooks/use-teams"
import { Skeleton } from "@/components/ui/skeleton"

export function TeamStats() {
  const { data: teams = [], isLoading, isError } = useTeams({ 
    includeMembers: true,
    activeOnly: false 
  })
  
  if (isLoading) {
    return (
      <>
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
        <StatsSkeleton />
      </>
    )
  }
  
  if (isError) {
    return (
      <>
        <StatsCard title="Total Teams" value="Error" icon={<UsersIcon className="h-4 w-4" />} />
        <StatsCard title="Active Teams" value="Error" icon={<UserCheckIcon className="h-4 w-4" />} />
        <StatsCard title="Total Members" value="Error" icon={<ShieldIcon className="h-4 w-4" />} />
        <StatsCard title="Team Leaders" value="Error" icon={<ClockIcon className="h-4 w-4" />} />
      </>
    )
  }
  
  // Calculate stats
  const totalTeams = teams.length
  
  const activeTeams = teams.filter(team => 
    team.isActive
  ).length
  
  const totalMembers = teams.reduce((acc, team) => 
    acc + (team._count?.members || 0), 0
  )
  
  const teamLeaders = teams.reduce((acc, team) => 
    acc + (team.members?.filter(member => member.role === 'LEADER').length || 0), 0
  )

  return (
    <>
      <StatsCard title="Total Teams" value={totalTeams.toString()} icon={<UsersIcon className="h-4 w-4" />} />
      <StatsCard title="Active Teams" value={activeTeams.toString()} icon={<UserCheckIcon className="h-4 w-4" />} />
      <StatsCard title="Total Members" value={totalMembers.toString()} icon={<ShieldIcon className="h-4 w-4" />} />
      <StatsCard title="Team Leaders" value={teamLeaders.toString()} icon={<ClockIcon className="h-4 w-4" />} />
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