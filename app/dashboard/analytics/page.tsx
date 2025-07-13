import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics & Reporting",
  description: "View analytics and generate reports",
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
        <p className="text-muted-foreground">
          View organization metrics and generate custom reports.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <p>Analytics dashboard will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          <p>Report generation tools will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 