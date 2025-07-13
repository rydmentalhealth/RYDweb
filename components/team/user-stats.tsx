"use client"

import { 
  UsersIcon, 
  UserCheckIcon, 
  ClockIcon, 
  XCircleIcon,
  UserXIcon,
  ShieldCheckIcon
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useUsers, type User } from "@/lib/hooks/use-users"
import { Skeleton } from "@/components/ui/skeleton"

export function UserStats() {
  const { data: users = [], isLoading, isError } = useUsers()
  
  if (isLoading) {
    return (
      <>
        <StatsSkeleton />
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
        <StatsCard title="Total Users" value="Error" icon={<UsersIcon className="h-4 w-4" />} />
        <StatsCard title="Active" value="Error" icon={<UserCheckIcon className="h-4 w-4" />} />
        <StatsCard title="Pending" value="Error" icon={<ClockIcon className="h-4 w-4" />} />
        <StatsCard title="Suspended" value="Error" icon={<UserXIcon className="h-4 w-4" />} />
        <StatsCard title="Rejected" value="Error" icon={<XCircleIcon className="h-4 w-4" />} />
      </>
    )
  }
  
  // Calculate stats
  const totalUsers = users.length
  
  const activeUsers = users.filter((user: User) => 
    user.status === 'ACTIVE'
  ).length
  
  const pendingUsers = users.filter((user: User) => 
    user.status === 'PENDING'
  ).length
  
  const suspendedUsers = users.filter((user: User) => 
    user.status === 'SUSPENDED' || user.status === 'INACTIVE'
  ).length
  
  const rejectedUsers = users.filter((user: User) => 
    user.status === 'REJECTED'
  ).length

  return (
    <>
      <StatsCard title="Total Users" value={totalUsers.toString()} icon={<UsersIcon className="h-4 w-4" />} />
      <StatsCard title="Active" value={activeUsers.toString()} icon={<UserCheckIcon className="h-4 w-4" />} />
      <StatsCard title="Pending" value={pendingUsers.toString()} icon={<ClockIcon className="h-4 w-4" />} />
      <StatsCard title="Suspended" value={suspendedUsers.toString()} icon={<UserXIcon className="h-4 w-4" />} />
      <StatsCard title="Rejected" value={rejectedUsers.toString()} icon={<XCircleIcon className="h-4 w-4" />} />
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