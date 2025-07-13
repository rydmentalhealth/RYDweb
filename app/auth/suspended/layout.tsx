import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account Suspended",
  description: "Your account has been suspended",
}

export default function SuspendedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 