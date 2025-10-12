import { LoginForm } from "@/components/login-form"
import { FirebaseLoginForm } from "@/components/firebase-login-form"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth" 
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
        <Tabs defaultValue="nextauth" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="nextauth">NextAuth (Database)</TabsTrigger>
            <TabsTrigger value="firebase">Firebase Auth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nextauth">
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="firebase">
            <Suspense fallback={<div>Loading...</div>}>
              <FirebaseLoginForm />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}
