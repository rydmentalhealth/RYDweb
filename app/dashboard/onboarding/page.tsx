import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Onboarding & Orientation",
  description: "Access onboarding materials and orientation resources",
}

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Onboarding & Orientation</h1>
        <p className="text-muted-foreground">
          Welcome materials and orientation resources for new volunteers and staff.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome Materials</h2>
          <p>Welcome materials will be displayed here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Orientation Checklist</h2>
          <p>Orientation checklist will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Introductory Resources</h2>
          <p>Introductory resources will be displayed here.</p>
        </div>
      </div>
    </div>
  )
} 