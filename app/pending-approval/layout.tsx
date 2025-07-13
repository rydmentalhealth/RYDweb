import { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Pending Approval",
  description: "Account pending approval",
}

export default async function PendingApprovalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect('/login')
  }
  
  // If user is already approved, redirect to dashboard
  if (session.user.status === 'ACTIVE') {
    redirect('/dashboard')
  }
  
  return (
    <>
      {children}
    </>
  )
} 