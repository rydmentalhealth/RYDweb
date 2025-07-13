import { Metadata } from "next"
import { TeamDetailClient } from "@/components/teams/team-detail-client"

export const metadata: Metadata = {
  title: "Team Management | RYD Mental Health",
  description: "Manage team members and assignments",
}

interface TeamDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params
  return <TeamDetailClient teamId={id} />
} 