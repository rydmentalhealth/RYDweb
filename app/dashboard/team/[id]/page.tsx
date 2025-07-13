import { Metadata } from "next"
import { notFound } from "next/navigation"
import { PrismaClient } from "@/lib/generated/prisma"
import { Button } from "@/components/ui/button"
import { TeamMemberCard } from "@/components/team/team-member-card"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Team Member Details",
  description: "View team member details and information",
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TeamMemberPage({ params }: PageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  // Check if user has permission to view team members
  if (!['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session.user.role)) {
    redirect('/dashboard')
  }
  
  const prisma = new PrismaClient()
  
  // Get the id from the params Promise
  const { id } = await params
  
  // Fetch user by ID (team member)
  const user = await prisma.user.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      avatar: true,
      phone: true,
      nationalId: true,
      role: true,
      status: true,
      district: true,
      region: true,
      availability: true,
      languages: true,
      skills: true,
      emergencyContact: true,
      jobTitle: true,
      department: true,
      createdAt: true,
      approvedAt: true,
    }
  })
  
  // If user not found, show 404
  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/team">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="sr-only">Back to team</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Team Member Details</h1>
        </div>
      </div>
      
      <div className="mx-auto max-w-md">
        <TeamMemberCard 
          member={user} 
          onEdit={() => {}} 
          onDelete={() => {}} 
        />
      </div>
    </div>
  )
} 