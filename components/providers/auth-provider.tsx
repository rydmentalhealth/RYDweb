"use client";

import { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, getSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

export function NextAuthProvider({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const sessionData = await getSession();
      
      console.log("[AuthProvider] Session fetched:", !!sessionData);
      
      // If on a protected route and no session in production, redirect to login
      if (!sessionData && 
          process.env.NODE_ENV === "production" && 
          pathname.startsWith("/dashboard") && 
          !pathname.startsWith("/login")) {
        console.log("[AuthProvider] No session in production on protected route, redirecting to login");
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      
      setSession(sessionData);
    } catch (error) {
      console.error("[AuthProvider] Failed to fetch session:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    fetchSession();
    
    // Set up interval to periodically check session in production
    let interval: NodeJS.Timeout | null = null;
    if (process.env.NODE_ENV === "production") {
      interval = setInterval(() => {
        fetchSession();
      }, 5 * 60 * 1000); // Check every 5 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchSession]);

  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
} 