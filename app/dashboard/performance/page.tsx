import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Performance & Feedback",
  description: "Manage performance reviews and feedback",
}

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance & Feedback</h1>
        <p className="text-muted-foreground">
          Manage performance reviews, feedback, and recognition.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Feedback Surveys</h2>
          <p>Feedback survey management will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Reviews</h2>
          <p>Performance review tools will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Badges & Recognition</h2>
          <p>Recognition system will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 