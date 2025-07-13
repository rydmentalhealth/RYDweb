import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { FilterIcon, DownloadIcon, PlusIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { Suspense } from "react"
import { ProjectsClient } from "@/components/projects/projects-client"
import { ProjectStats } from "@/components/projects/project-stats"
import { AddProjectSheet } from "@/components/projects/add-project-sheet"
import PermissionChecker from "@/components/auth/permission-checker"

export const metadata: Metadata = {
  title: "Project Management",
  description: "Manage projects and team assignments.",
}

export default async function ProjectsPage() {
  await auth()
  
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">Project Management</h1>
                  <p className="text-muted-foreground">
                    Create, manage, and track project progress.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <PermissionChecker 
                    requiredPermission="CREATE_PROJECTS"
                    fallback={null}
                  >
                  <AddProjectSheet
                    trigger={
                      <Button size="sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Project
                      </Button>
                    }
                  />
                  </PermissionChecker>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-4 md:px-6 lg:grid-cols-4">
              <Suspense fallback={<div className="py-4 text-center">Loading stats...</div>}>
                <ProjectStats />
              </Suspense>
            </div>
            
            <div className="px-4 md:px-6">
              <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                  <Suspense fallback={<div className="py-8 text-center">Loading projects...</div>}>
                <ProjectsClient />
              </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 