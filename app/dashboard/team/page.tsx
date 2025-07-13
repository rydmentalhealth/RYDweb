import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { FilterIcon, DownloadIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { AddMemberSheet } from "@/components/team/add-member-sheet"
import { Suspense } from "react"
import { UserStats } from "@/components/team/user-stats"
import { UsersClient } from "@/components/team/users-client"

export const metadata: Metadata = {
  title: "Team Members Management | RYD Mental Health",
  description: "Manage individual team members, volunteers and staff",
}

export default async function TeamPage() {
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
                  <h1 className="text-2xl font-semibold">System Users</h1>
                  <p className="text-muted-foreground">
                    Manage individual system users, volunteers and staff.
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
                  <AddMemberSheet />
                </div>
              </div>
            </div>
            
            {/* User Statistics */}
            <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-5 md:px-6 lg:grid-cols-5">
              <Suspense fallback={<div className="py-4 text-center">Loading stats...</div>}>
                <UserStats />
              </Suspense>
            </div>
            
            {/* Enhanced Users Management */}
            <div className="px-4 md:px-6">
              <div className="rounded-lg border shadow-sm">
                <div className="p-6">
                  <Suspense fallback={<div className="py-8 text-center">Loading users...</div>}>
                    <UsersClient />
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