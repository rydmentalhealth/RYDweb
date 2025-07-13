import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, UserCheck, Edit, LogOut } from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import { StatusChecker } from "@/components/status-checker"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Account Pending Approval",
  description: "Your account is awaiting admin approval",
}

export default async function PendingApprovalPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  // If user is already approved, redirect to dashboard
  if (session.user.status === 'ACTIVE') {
    redirect('/dashboard')
  }
  
  // Fetch user profile for avatar and name
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      avatar: true,
    }
  })
  
  const userName = userProfile?.name || 
    (userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}` 
      : userProfile?.email?.split('@')[0] || 'User')
  
  const getInitials = () => {
    const firstName = userProfile?.firstName || ''
    const lastName = userProfile?.lastName || ''
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    return userName.slice(0, 2).toUpperCase()
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Status Checker - monitors for approval and auto-redirects */}
      <StatusChecker />
      
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Account Pending Approval</h1>
          <p className="text-gray-600 mt-2">Welcome to RYD HR & Volunteer Management</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile?.avatar || ""} alt="Profile picture" />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-600" />
                Hello, {userName}!
              </CardTitle>
            </div>
            <CardDescription>
              Your account has been successfully created and is currently awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-amber-200 bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>What happens next?</strong><br />
                Our administrators will review your application and approve your account within 1-2 business days. 
                You'll receive an email notification once your account is activated.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">While you wait, you can:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Update your profile information
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Add your profile picture
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Review our policies and guidelines
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Check back later for updates
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/pending-approval/profile" className="flex-1">
                <Button variant="default" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
              <SignOutButton variant="outline" className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </SignOutButton>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact us at <a href="mailto:info@rydmentalhealth.org" className="text-blue-600 hover:underline">info@rydmentalhealth.org</a></p>
        </div>
      </div>
    </div>
  )
} 