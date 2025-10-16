"use client"

import { OrganizationIdGenerator } from "@/components/dashboard/id-generator/organization-id-generator"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

export default function IdGeneratorPage() {
  const permissions = usePermissions()

  // Only Super Admin and Admin can access this page
  if (!permissions.isAdmin && !permissions.isSuperAdmin) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 md:px-6">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access the ID Generator. This feature is only available to Administrators and Super Administrators.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="px-4 md:px-6">
        <OrganizationIdGenerator />
      </div>
    </div>
  )
}