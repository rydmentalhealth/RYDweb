import { Metadata } from "next"
import { SettingsDashboard } from "@/components/settings/settings-dashboard"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage application settings and system configurations",
}

export default function SettingsPage() {
  return <SettingsDashboard />
} 