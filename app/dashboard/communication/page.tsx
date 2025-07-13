import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Communication",
  description: "Manage announcements and internal communications",
}

export default function CommunicationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
        <p className="text-muted-foreground">
          Manage announcements, notifications, and internal communications.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Announcements</h2>
          <p>Announcement management will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <p>Messaging features will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Email Notifications</h2>
          <p>Email notification management will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 