import { LoginForm } from "@/components/login-form"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth" 
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Login - RYD Admin",
  description: "Login to access the RYD Admin dashboard",
}

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

async function LoginPageContent() {
  let session = null;
  
  try {
    session = await auth();
  } catch (error) {
    console.error("[Login Page] Auth error - likely missing NEXTAUTH_SECRET:", error);
    // Continue without session - show login form
  }
  
  console.log("[Login Page] Session check:", !!session);
  if (session?.user) {
    console.log("[Login Page] User authenticated, redirecting to dashboard:", session.user.email);
    redirect("/dashboard")
  } else {
    console.log("[Login Page] No session found, showing login form");
  }
  
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}
