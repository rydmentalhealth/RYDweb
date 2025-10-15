import { Metadata } from "next"
import { HRDashboard } from "@/components/hr/hr-dashboard"

export const metadata: Metadata = {
  title: "Human Resources Management",
  description: "Comprehensive HR management system for employee lifecycle, recruitment, and workforce analytics",
}

export default function HRPage() {
  return <HRDashboard />
}