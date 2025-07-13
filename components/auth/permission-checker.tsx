"use client"

import { ReactNode } from "react"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { PERMISSIONS } from "@/lib/auth/rbac"

interface PermissionCheckerProps {
  requiredPermission: keyof typeof PERMISSIONS
  children: ReactNode
  fallback?: ReactNode
  showFallback?: boolean
}

export default function PermissionChecker({
  requiredPermission,
  children,
  fallback = null,
  showFallback = true
}: PermissionCheckerProps) {
  const permissions = usePermissions()
  
  // Loading state
  if (permissions.user.isLoading) {
    return showFallback ? (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    ) : null
  }
  
  // Check if user has the required permission
  const hasPermission = permissions.hasPermission(requiredPermission)
  
  if (hasPermission) {
    return <>{children}</>
  }
  
  // Show fallback if permission check fails
  return showFallback ? <>{fallback}</> : null
} 