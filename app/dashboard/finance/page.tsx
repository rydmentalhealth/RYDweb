import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finance Module",
  description: "Track expenses, income, and financial records",
}

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Finance Module</h1>
        <p className="text-muted-foreground">
          Track expenses, income, investments, donations, and grants.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
          <p>Financial dashboard will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Transactions</h2>
          <p>Transaction management will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Donations & Grants</h2>
          <p>Donation and grant tracking will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 