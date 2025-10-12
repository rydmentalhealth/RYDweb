"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signInWithEmail, signOutUser, onAuthStateChange, FirebaseUser } from "@/lib/firebase-auth"

export function FirebaseLoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        console.log("[Firebase Login] User authenticated:", user.email);
        // Redirect to dashboard if user is authenticated
        router.push("/firebase-dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle credentials sign in
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("[Firebase Login] Starting authentication");
      
      const result = await signInWithEmail(email, password);
      
      if (result.user) {
        console.log("[Firebase Login] Authentication successful");
        toast.success("Login successful!");
        router.push("/firebase-dashboard");
      }
    } catch (err: any) {
      console.error("[Firebase Login] Error during sign in:", err);
      toast.error(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast.success("Signed out successfully");
    } catch (err: any) {
      console.error("[Firebase Login] Error during sign out:", err);
      toast.error("Error signing out");
    }
  };

  // If user is already authenticated, show a different UI
  if (user) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-balance text-muted-foreground">
                  You are already logged in
                </p>
              </div>
              
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Logged in as {user.email} ({user.role})
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => router.push("/firebase-dashboard")}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex-1"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form 
            className="p-6 md:p-8" 
            onSubmit={handleCredentialsSignIn}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">RYD Admin - Firebase Login</h1>
                <p className="text-balance text-muted-foreground">
                  Login with Firebase authentication
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in with Firebase"}
              </Button>
              
              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Test accounts available - see console for details
                </p>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholder.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground">
        Built by{' '}
        <a 
          href="https://lawmwad.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors duration-200"
        >
          LAWMWAD TECHNOLOGIES
        </a>
      </div>
    </div>
  )
}