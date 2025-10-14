import { FirebaseLoginForm } from "@/components/firebase-login-form"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Firebase Login - RYD Admin",
  description: "Login to access the RYD Admin dashboard using Firebase authentication",
}

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function FirebaseLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Suspense fallback={<div>Loading...</div>}>
          <FirebaseLoginForm />
        </Suspense>
      </div>
    </div>
  )
}