"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { useSession } from "next-auth/react"
import data from "./data.json"

export default function DashboardPage() {
  console.log("[Dashboard Page] Rendering dashboard page");
  const { data: session } = useSession()
  console.log("[Dashboard Page] Session check:", !!session);
  
  const user = session?.user
  if (user) {
    console.log("[Dashboard Page] User authenticated:", user.email);
  } else {
    console.log("[Dashboard Page] No user in session");
  }
  
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-6">
            <div className="px-4 md:px-6">
              <div className="flex flex-col gap-6">
                {/* Welcome Section */}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                  </h1>
                  <p className="text-muted-foreground">
                    Here's what's happening with your team and projects today.
                  </p>
                </div>
                
                {/* Statistics Cards */}
                <StatsCards />
                
                {/* Recent Tasks */}
                <RecentTasks />
                
                {/* Existing Charts and Data Table */}
                <div className="grid gap-6 md:grid-cols-2">
                  <SectionCards />
                  <ChartAreaInteractive />
                </div>
                
                {/* <DataTable data={data} /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}