import { Metadata } from "next"
import { BarChartIcon, CalendarIcon, ClipboardListIcon, HeartPulseIcon, UsersIcon, WalletIcon } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardGuard } from "@/components/auth/dashboard-guard"
import Link from "next/link"

import data from "./data.json"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "RYD HR & Volunteer Management Dashboard",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardGuard>
      <SidebarProvider>
        <AppSidebar variant="inset" />
          <SidebarInset>
            {children}
          </SidebarInset>
      </SidebarProvider>
    </DashboardGuard>
  )
}