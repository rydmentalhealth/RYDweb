'use client'

import { Metadata } from "next"
import { Suspense } from "react"
import { AttendanceTrackingDashboard } from "@/components/attendance/attendance-tracking-dashboard"

export default function AttendancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AttendanceTrackingDashboard />
    </Suspense>
  )
}
