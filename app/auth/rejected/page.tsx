import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { XCircle, Mail, LogOut } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

export const metadata: Metadata = {
  title: "Application Rejected",
  description: "Your application has been rejected",
}

export default function RejectedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Application Rejected</h1>
          <p className="text-gray-600 mt-2">Your account application was not approved</p>
        </div>

        {/* Main Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Application Status: Rejected
            </CardTitle>
            <CardDescription>
              Unfortunately, your application to join RYD has been rejected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <Mail className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>What this means:</strong><br />
                Your application did not meet our current requirements or we are not accepting new members at this time.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  You may reapply in the future when applications reopen
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Contact us if you believe this was an error
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Check our website for volunteer opportunities
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
            Questions? Contact us at{" "}
            <a href="mailto:info@rydmentalhealth.org" className="text-red-600 hover:underline">
            info@rydmentalhealth.org
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 