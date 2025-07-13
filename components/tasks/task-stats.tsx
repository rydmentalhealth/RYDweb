"use client"

import { 
  ClipboardCheckIcon, 
  ClockIcon, 
  AlertCircleIcon, 
  CheckCircleIcon 
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTasks } from "@/lib/hooks/use-tasks"
import { Skeleton } from "@/components/ui/skeleton"

export function TaskStats() {
  const { data: tasks = [], isLoading, isError } = useTasks()
  
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
        <StatsCard title="Total Tasks" value="Error" icon={<ClipboardCheckIcon className="h-4 w-4" />} />
        <StatsCard title="Not Started" value="Error" icon={<ClockIcon className="h-4 w-4" />} />
        <StatsCard title="In Progress" value="Error" icon={<AlertCircleIcon className="h-4 w-4" />} />
        <StatsCard title="Completed" value="Error" icon={<CheckCircleIcon className="h-4 w-4" />} />
      </>
    )
  }
  
  // Calculate stats
  const totalTasks = tasks.length
  
  const notStarted = tasks.filter(task => 
    task.status === 'NOT_STARTED'
  ).length
  
  const inProgress = tasks.filter(task => 
    task.status === 'IN_PROGRESS'
  ).length
  
  const completed = tasks.filter(task => 
    task.status === 'COMPLETED'
  ).length

  return (
    <>
      <StatsCard title="Total Tasks" value={totalTasks.toString()} icon={<ClipboardCheckIcon className="h-4 w-4" />} />
      <StatsCard title="Not Started" value={notStarted.toString()} icon={<ClockIcon className="h-4 w-4" />} />
      <StatsCard title="In Progress" value={inProgress.toString()} icon={<AlertCircleIcon className="h-4 w-4" />} />
      <StatsCard title="Completed" value={completed.toString()} icon={<CheckCircleIcon className="h-4 w-4" />} />
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