import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PendingUserProfileForm } from "@/components/pending-user-profile-form"
import { StatusChecker } from "@/components/status-checker"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Update Profile - Pending Approval",
  description: "Update your profile information while awaiting approval",
}

export default async function PendingProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  // If user is already approved, redirect to dashboard
  if (session.user.status === 'ACTIVE') {
    redirect('/dashboard')
  }
  
  // Fetch complete user profile data
  const userProfile = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      bio: true,
      location: true,
      district: true,
      region: true,
      languages: true,
      skills: true,
      emergencyContact: true,
      availability: true,
      role: true,
      status: true,
    }
  })
  
  if (!userProfile) {
    redirect('/login')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Status Checker - monitors for approval and auto-redirects */}
      <StatusChecker />
      
      <div className="w-full max-w-2xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/pending-approval">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Profile</h1>
            <p className="text-gray-600">Complete your profile information</p>
          </div>
        </div>

        {/* Profile Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details. This information will help our team better understand your background and skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingUserProfileForm user={userProfile} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 