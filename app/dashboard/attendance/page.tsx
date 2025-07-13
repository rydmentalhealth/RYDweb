import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Attendance & Availability",
  description: "Track attendance and manage volunteer availability",
}

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance & Availability</h1>
        <p className="text-muted-foreground">
          Track team attendance and manage volunteer availability schedules.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Check-In System</h2>
          <p>Attendance tracking features will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Availability Calendar</h2>
          <p>Volunteer availability management will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 