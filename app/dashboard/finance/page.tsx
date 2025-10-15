import { Metadata } from "next"
import { FinanceDashboard } from "@/components/finance/finance-dashboard"

export const metadata: Metadata = {
  title: "Finance & Resource Tracking",
  description: "Comprehensive financial management system for stipends, expenses, budgets, and reporting",
}

export default function FinancePage() {
  return <FinanceDashboard />
} 