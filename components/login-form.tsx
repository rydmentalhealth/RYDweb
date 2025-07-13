"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for URL messages
  const message = searchParams.get('message');

  // Handle URL messages
  useEffect(() => {
    if (message === 'status-changed') {
      toast.success('Your account status has been updated. Please log in again.');
    }
  }, [message]);

  // For provider sign-in (Google, Apple, etc.)
  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true);
    
    try {
      console.log(`[Login Form] Starting ${provider} authentication`);
      await signIn(provider, { 
        callbackUrl: "/dashboard",
        redirect: true
      });
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
      setIsLoading(false);
    }
  };

  // For email link sign-in
  const handleEmailLinkSignIn = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("[Login Form] Starting email link authentication");
      await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: false
      });
      
      toast.success("Check your email for a sign in link!");
      setIsLoading(false);
    } catch (err) {
      console.error("Error sending sign in link:", err);
      toast.error("Failed to send sign in link. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle credentials sign in
  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("[Login Form] Starting credentials authentication");
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      }) as any;
      
      if (result?.error) {
        console.error("[Login Form] Authentication error:", result.error);
        toast.error(result.error || "Authentication failed");
        setIsLoading(false);
      } else if (result?.url) {
        console.log("[Login Form] Authentication successful, redirecting");
        router.push(result.url);
      } else {
        console.log("[Login Form] Authentication successful, redirecting to dashboard");
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("[Login Form] Error during sign in:", err);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

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
                <h1 className="text-2xl font-bold">Welcome to RYD Admin</h1>
                <p className="text-balance text-muted-foreground">
                  Login to access your dashboard
                </p>
              </div>
              
              {/* Status change message */}
              {message === 'status-changed' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your account status has been updated. Please log in to continue.
                  </AlertDescription>
                </Alert>
              )}
              
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={handleEmailLinkSignIn}
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    disabled={isLoading}
                  >
                    Login with email link
                  </button>
                </div>
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
                {isLoading ? "Signing in..." : "Sign in with Email & Password"}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleProviderSignIn("google")}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="ml-2">Google</span>
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleProviderSignIn("apple")}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="ml-2">Apple</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Sign up
                </a>
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
