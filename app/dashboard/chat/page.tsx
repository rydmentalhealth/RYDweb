import { Metadata } from "next"
import { ChatInterface } from "@/components/chat/chat-interface"

export const metadata: Metadata = {
  title: "Chat",
  description: "Communicate with your team and colleagues",
}

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">
          Connect and collaborate with your team members in real-time
        </p>
      </div>
      <ChatInterface />
    </div>
  )
}