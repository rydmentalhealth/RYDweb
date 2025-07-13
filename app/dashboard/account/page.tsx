import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings and preferences",
}

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and account security.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <p>Profile management features will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <p>Password and security settings will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <p>Notification settings will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 