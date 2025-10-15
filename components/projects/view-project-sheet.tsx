"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { useProject } from "@/lib/hooks/use-projects"
import { Skeleton } from "@/components/ui/skeleton"
import { ProjectDashboard } from "./project-dashboard"

interface ViewProjectSheetProps {
  projectId: string
  trigger: React.ReactNode
}

export function ViewProjectSheet({ projectId, trigger }: ViewProjectSheetProps) {
  const [open, setOpen] = useState(false)
  
  // Fetch project data
  const { 
    data: project, 
    isLoading, 
    isError 
  } = useProject(projectId)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="text-center py-4">
            <p className="text-red-500">Failed to load project details</p>
          </div>
        ) : project ? (
          <ProjectDashboard project={project} />
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No project data found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 