import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { FilterIcon, DownloadIcon, PlusIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { Suspense } from "react"
import { TeamsClient } from "@/components/teams/teams-client"
import { TeamStats } from "@/components/teams/team-stats"
import PermissionChecker from "@/components/auth/permission-checker"

export const metadata: Metadata = {
  title: "Teams Management | RYD Mental Health",
  description: "Manage organizational teams, team structure, and assign system users to teams",
}

export default async function TeamsManagementPage() {
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
                  <h1 className="text-2xl font-semibold">Teams Management</h1>
                  <p className="text-muted-foreground">
                    Manage organizational teams, team structure, and assign system users to teams.
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
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-4 md:px-6 lg:grid-cols-4">
              <Suspense fallback={<div className="py-4 text-center">Loading stats...</div>}>
                <TeamStats />
              </Suspense>
            </div>
            
            <div className="px-4 md:px-6">
              <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                  <PermissionChecker 
                    requiredPermission="VIEW_TEAM"
                    fallback={
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                          <p className="text-muted-foreground">
                            You don't have permission to view teams. Please contact an administrator.
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Suspense fallback={<div className="py-8 text-center">Loading teams...</div>}>
                      <TeamsClient />
                    </Suspense>
                  </PermissionChecker>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 