import { Metadata } from "next"
import { CommunicationHub } from "@/components/communication/communication-hub"

export const metadata: Metadata = {
  title: "RYD Connect Center",
  description: "Internal communication hub for team collaboration and updates",
}

export default function CommunicationPage() {
  return <CommunicationHub />
} 