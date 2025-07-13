"use client"

import * as React from "react"
import {
  BarChartIcon,
  CalendarIcon,
  ClipboardListIcon,
  FileTextIcon,
  HeartPulseIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  FolderKanbanIcon,
  Users2Icon,
  type LucideIcon,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { usePendingUsersCount } from "@/lib/hooks/use-pending-users"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const permissions = usePermissions()
  
  // Fetch pending users count for admins
  const { data: pendingData } = usePendingUsersCount()
  const pendingCount = pendingData?.count || 0
  
  const userData = {
    name: session?.user?.name || "Guest",
    email: session?.user?.email || "guest@example.com",
    avatar: session?.user?.image || "/avatars/default.jpg",
  }

  // Build main navigation items based on user permissions
  const mainNavItems = React.useMemo(() => {
    const items: Array<{
      title: string;
      url: string;
      icon?: LucideIcon;
      badge?: number;
    }> = [];
    
    // If user is pending, don't show any navigation items
    if (session?.user?.status === 'PENDING') {
      return items;
    }
    
    // Dashboard - always accessible to authenticated users
    items.push({
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
    });
    
    // Team Members - staff and above with pending badge for admins
    if (permissions.canViewTeam) {
      items.push({
        title: "System Users",
        url: "/dashboard/team",
        icon: Users2Icon,
        badge: permissions.canManageUsers && pendingCount > 0 ? pendingCount : undefined,
      });
    }
    
    // Teams (organizational structure) - staff and above
    if (permissions.canViewTeam) {
      items.push({
        title: "Teams Management",
        url: "/dashboard/teams",
        icon: UsersIcon,
      });
    }
    
    // Tasks - all users can view
    if (permissions.canViewTasks) {
      items.push({
        title: "Tasks",
        url: "/dashboard/tasks",
        icon: ClipboardListIcon,
      });
    }
    
    // Projects - all users can view
    if (permissions.canViewProjects) {
      items.push({
        title: "Projects",
        url: "/dashboard/projects",
        icon: FolderKanbanIcon,
      });
    }
    
    // Attendance - basic feature for all users
    items.push({
        title: "Attendance",
        url: "/dashboard/attendance",
        icon: CalendarIcon,
    });
    
    // Analytics - staff and above
    if (permissions.canViewAnalytics) {
      items.push({
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChartIcon,
      });
    }
    
    return items;
  }, [permissions, pendingCount, session?.user?.status]);

  // Build secondary nav items based on permissions
  const secondaryNavItems = React.useMemo(() => {
    const items = [];
    
    // Settings - all users have basic settings
    items.push({
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    });
    
    // Help - always available
    items.push({
      title: "Help",
      url: "/dashboard/help",
      icon: HelpCircleIcon,
    });
    
    // Search - always available
    items.push({
      title: "Search",
      url: "/dashboard/search",
      icon: SearchIcon,
    });
    
    return items;
  }, []);

  // Build document/resource items based on permissions
  const documentItems = React.useMemo(() => {
    const items = [];
    
    // Documents/Resources - all users
    if (permissions.canViewDocuments) {
      items.push({
        name: "Resources",
        url: "/dashboard/resources",
        icon: FileTextIcon,
      });
    }
    
    // Finance - staff and above
    if (permissions.canViewReports) {
      items.push({
        name: "Finance",
        url: "/dashboard/finance",
        icon: WalletIcon,
      });
    }
    
    return items;
  }, [permissions]);

  // Build cloud/category items based on permissions
  const cloudItems = React.useMemo(() => {
    const items = [];
    
    // Onboarding - visible to all users
    items.push({
        title: "Onboarding",
        icon: UserIcon,
        url: "/dashboard/onboarding",
        items: [
          {
            title: "Welcome Materials",
            url: "/dashboard/onboarding/welcome",
          },
          {
            title: "Orientation",
            url: "/dashboard/onboarding/orientation",
          },
        ],
    });
    
    // Communication - visible to all users
    items.push({
        title: "Communication",
        icon: MessageSquareIcon,
        url: "/dashboard/communication",
        items: [
          {
            title: "Announcements",
            url: "/dashboard/communication/announcements",
          },
          {
            title: "Messages",
            url: "/dashboard/communication/messages",
          },
        ],
    });
    
    // Performance - staff and above
    if (permissions.canViewReports) {
      items.push({
        title: "Performance",
        icon: HeartPulseIcon,
        url: "/dashboard/performance",
        items: [
          {
            title: "Feedback",
            url: "/dashboard/performance/feedback",
          },
          {
            title: "Reviews",
            url: "/dashboard/performance/reviews",
          },
        ],
      });
    }
    
    return items;
  }, [permissions]);

  const data = {
    user: userData,
    navMain: mainNavItems,
    navClouds: cloudItems,
    navSecondary: secondaryNavItems,
    documents: documentItems,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <HeartPulseIcon className="h-5 w-5" />
                <span className="text-base font-semibold">RYD Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.documents.length > 0 && <NavDocuments items={data.documents} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
