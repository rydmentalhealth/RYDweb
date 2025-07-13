"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Mail, LogOut, CheckCircle, RefreshCw } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"
import { useUserStatus } from "@/lib/hooks/use-user-status"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

export default function SuspendedPage() {
  const [mounted, setMounted] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  
  // Only run hooks after component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    )
  }

  return <SuspendedPageContent />
}

function SuspendedPageContent() {
  const sessionResult = useSession()
  const router = useRouter()
  const userStatusQuery = useUserStatus()
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  const session = sessionResult?.data
  const update = sessionResult?.update
  const statusData = userStatusQuery?.data
  const isLoading = userStatusQuery?.isLoading || false
  const refetch = userStatusQuery?.refetch

  // Check status periodically and handle status changes
  useEffect(() => {
    if (!session?.user || !statusData) return

    // If user is no longer suspended, redirect to login
    if (statusData.status !== 'SUSPENDED') {
      const redirectToLogin = async () => {
        if (statusData.status === 'ACTIVE') {
          toast.success('🎉 Your suspension has been lifted! Redirecting to login...')
        } else {
          toast.info('Your account status has changed. Redirecting to login...')
        }
        
        // Update the session with new status
        if (update) {
        await update({
          ...session,
          user: {
            ...session.user,
            status: statusData.status,
          }
        })
        }
        
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?message=status-changed')
        }, 2000)
      }

      redirectToLogin()
    }
  }, [statusData, session, update, router])

  const handleManualCheck = async () => {
    if (!refetch) return
    
    setIsCheckingStatus(true)
    try {
      await refetch()
      toast.info('Status checked')
    } catch (error) {
      toast.error('Failed to check status')
    } finally {
      setIsCheckingStatus(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Account Suspended</h1>
          <p className="text-gray-600 mt-2">Your account access has been temporarily restricted</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
              Account Status: Suspended
            </CardTitle>
            <CardDescription>
              Your account has been temporarily suspended by an administrator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Check Alert */}
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="text-xs mt-1">
                  If your suspension is lifted, you'll be automatically redirected to the login page.
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="border-amber-200 bg-amber-50">
              <Mail className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>What this means:</strong><br />
                Your account access has been temporarily restricted. This may be due to policy violations or administrative requirements.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">To resolve this:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Contact your administrator for more information
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Review our terms of service and policies
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Wait for administrative review to complete
                </li>
              </ul>
            </div>
            
            <div className="pt-4">
              <SignOutButton variant="default" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </SignOutButton>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:info@rydmentalhealth.org" className="text-amber-600 hover:underline">
            info@rydmentalhealth.org
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 