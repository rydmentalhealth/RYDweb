import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { ProjectAnalytics } from "@/components/projects/project-analytics"
import { auth } from "@/lib/auth"
import { Suspense } from "react"
import PermissionChecker from "@/components/auth/permission-checker"

export const metadata: Metadata = {
  title: "Project Analytics",
  description: "Comprehensive project analytics and reporting dashboard.",
}

export default async function ProjectAnalyticsPage() {
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
                  <h1 className="text-2xl font-semibold">Project Analytics</h1>
                  <p className="text-muted-foreground">
                    Comprehensive insights into project performance and team productivity
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-4 md:px-6">
              <PermissionChecker 
                requiredPermission="VIEW_PROJECT_ANALYTICS"
                fallback={
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      You don't have permission to view project analytics.
                    </p>
                  </div>
                }
              >
                <Suspense fallback={<div className="py-8 text-center">Loading analytics...</div>}>
                  <ProjectAnalytics projects={[]} />
                </Suspense>
              </PermissionChecker>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}