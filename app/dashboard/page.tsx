"use client"

import { SiteHeader } from "@/components/site-header"
import { useSession } from "next-auth/react"
import { SuperAdminDashboard } from "@/components/dashboard/role-dashboards/super-admin-dashboard"
import { AdminDashboard } from "@/components/dashboard/role-dashboards/admin-dashboard"
import { TeamLeadDashboard } from "@/components/dashboard/role-dashboards/team-lead-dashboard"
import { StaffDashboard } from "@/components/dashboard/role-dashboards/staff-dashboard"
import { VolunteerDashboard } from "@/components/dashboard/role-dashboards/volunteer-dashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default function DashboardPage() {
  console.log("[Dashboard Page] Rendering dashboard page");
  const { data: session, status } = useSession()
  console.log("[Dashboard Page] Session check:", !!session);
  
  const user = session?.user
  const userRole = user?.role
  
  if (user) {
    console.log("[Dashboard Page] User authenticated:", user.email, "Role:", userRole);
  } else {
    console.log("[Dashboard Page] No user in session");
  }

  // Loading state
  if (status === "loading") {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6">
              <div className="px-4 md:px-6">
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-32" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (!session || !user) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-6">
              <div className="px-4 md:px-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to load dashboard. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Render role-based dashboard
  const renderRoleDashboard = () => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />
      case 'ADMIN':
        return <AdminDashboard />
      case 'TEAM_LEAD':
        return <TeamLeadDashboard />
      case 'STAFF':
        return <StaffDashboard />
      case 'VOLUNTEER':
        return <VolunteerDashboard />
      default:
        return (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unknown user role: {userRole}. Please contact your administrator.
            </AlertDescription>
          </Alert>
        )
    }
  }
  
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 md:px-6">
              {renderRoleDashboard()}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}