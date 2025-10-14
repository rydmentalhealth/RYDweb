import { LoginForm } from "@/components/login-form"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth" 
import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        
        {/* Firebase Login Option */}
        <div className="mt-6 text-center">
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or try Firebase Authentication
            </span>
          </div>
          <div className="mt-4">
            <Link href="/firebase-login">
              <Button variant="outline" className="w-full">
                Login with Firebase
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}
