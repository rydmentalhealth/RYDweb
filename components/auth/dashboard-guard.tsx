"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Loader2 } from "lucide-react"

interface DashboardGuardProps {
  children: React.ReactNode
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const [mounted, setMounted] = useState(false)
  
  // Only run hooks after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return <DashboardGuardContent>{children}</DashboardGuardContent>
}

function DashboardGuardContent({ children }: DashboardGuardProps) {
  const sessionResult = useSession()
  const router = useRouter()
  const [isValidating, setIsValidating] = useState(true)

  const session = sessionResult?.data
  const status = sessionResult?.status

  useEffect(() => {
    console.log("[DashboardGuard] Session status:", status)
    console.log("[DashboardGuard] Session data:", session?.user?.email, "Role:", session?.user?.role, "Status:", session?.user?.status)

    if (status === "loading") {
      return
    }

    if (status === "unauthenticated" || !session?.user) {
      console.log("[DashboardGuard] No session, redirecting to login")
      router.push('/login')
      return
    }

    const userStatus = session.user.status
    const userRole = session.user.role

    console.log("[DashboardGuard] Validating user:", {
      email: session.user.email,
      status: userStatus,
      role: userRole
    })

    // Check user status and redirect accordingly
    if (userStatus === 'SUSPENDED' || userStatus === 'INACTIVE') {
      console.log("[DashboardGuard] User suspended/inactive, redirecting")
      router.push('/auth/suspended')
      return
    }

    if (userStatus === 'REJECTED') {
      console.log("[DashboardGuard] User rejected, redirecting")
      router.push('/auth/rejected')
      return
    }

    if (userStatus === 'PENDING') {
      console.log("[DashboardGuard] User pending approval, redirecting")
      router.push('/pending-approval')
      return
    }

    if (userStatus !== 'ACTIVE') {
      console.log("[DashboardGuard] Invalid user status:", userStatus)
      router.push('/auth/signin')
      return
    }

    // User is valid
    console.log("[DashboardGuard] User validation successful")
    setIsValidating(false)
  }, [session, status, router])

  // Loading state
  if (status === "loading" || isValidating) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <Alert className="max-w-md">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Authentication required. Redirecting to login...
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Valid session - render children
  return <>{children}</>
} 