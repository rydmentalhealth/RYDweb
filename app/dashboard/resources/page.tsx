import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resources & Documents",
  description: "Access and manage organization resources and documents",
}

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resources & Documents</h1>
        <p className="text-muted-foreground">
          Access training materials, policies, and other organizational resources.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Document Library</h2>
          <p>Document management features will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Training Materials</h2>
          <p>Training resource management will be implemented here.</p>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Media Gallery</h2>
          <p>Media management will be implemented here.</p>
        </div>
      </div>
    </div>
  )
} 