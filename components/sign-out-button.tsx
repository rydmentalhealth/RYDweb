"use client"

import { signOut } from "next-auth/react"
import { Button, ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"

interface SignOutButtonProps extends ButtonProps {
  children: React.ReactNode
}

export const SignOutButton = forwardRef<HTMLButtonElement, SignOutButtonProps>(
  ({ children, ...props }, ref) => {
    const handleSignOut = () => {
      signOut({ callbackUrl: '/login' })
    }

    return (
      <Button ref={ref} onClick={handleSignOut} {...props}>
        {children}
      </Button>
    )
  }
)

SignOutButton.displayName = "SignOutButton" 