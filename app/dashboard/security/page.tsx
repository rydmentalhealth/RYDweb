"use client"

import { SecurityControlPanel } from "@/components/security/security-control-panel"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"
import { UserRole } from "@prisma/client"

export default function SecurityPage() {
  const permissions = usePermissions()

  // Only Super Admin can access the Security Control Panel
  if (!permissions.isSuperAdmin) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 md:px-6">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Access denied. The Security Control Panel is only available to Super Administrators.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 md:px-6">
        <SecurityControlPanel />
      </div>
    </div>
  )
}