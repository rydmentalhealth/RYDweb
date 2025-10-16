"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Hash, 
  AtSign,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Settings,
  UserPlus,
  Pin,
  Star,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { format } from "date-fns"

interface ChatUser {
  id: string
  name: string
  avatar?: string
  role: string
  department?: string
  isOnline: boolean
  lastSeen?: string
}

interface ChatChannel {
  id: string
  name?: string
  type: 'DIRECT' | 'GROUP' | 'DEPARTMENT' | 'PROJECT'
  avatar?: string
  members: ChatUser[]
  unreadCount: number
  lastMessage?: {
    id: string
    content: string
    author: ChatUser
    createdAt: string
  }
  isActive: boolean
}

interface ChatMessage {
  id: string
  content: string
  author: ChatUser
  createdAt: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  reactions: Array<{
    emoji: string
    users: ChatUser[]
  }>
  replyTo?: {
    id: string
    content: string
    author: ChatUser
  }
}

export function ChatInterface() {
  const { data: session } = useSession()
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<ChatUser[]>([])
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatData()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchChatData = async () => {
    try {
      setLoading(true)
      
      const [channelsRes, usersRes] = await Promise.all([
        fetch('/api/communication/channels'),
        fetch('/api/admin/users?status=ACTIVE')
      ])

      if (channelsRes.ok) {
        const channelsData = await channelsRes.json()
        setChannels(channelsData.channels || [])
        
        // Auto-select first channel if available
        if (channelsData.channels?.length > 0 && !activeChannel) {
          setActiveChannel(channelsData.channels[0])
          fetchMessages(channelsData.channels[0].id)
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users?.map((user: any) => ({
          ...user,
          isOnline: Math.random() > 0.5, // Mock online status
          lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        })) || [])
      }
    } catch (error) {
      console.error('Error fetching chat data:', error)
      toast.error('Failed to load chat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (channelId: string) => {
    try {
      const response = await fetch(`/api/communication/channels/${channelId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleChannelSelect = (channel: ChatChannel) => {
    setActiveChannel(channel)
    fetchMessages(channel.id)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeChannel) return

    try {
      const response = await fetch(`/api/communication/channels/${activeChannel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput })
      })

      if (response.ok) {
        setMessageInput("")
        fetchMessages(activeChannel.id)
        fetchChatData() // Refresh channels to update last message
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleCreateDirectMessage = async (userId: string) => {
    try {
      const response = await fetch('/api/communication/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DIRECT',
          memberIds: [userId]
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsNewChatOpen(false)
        fetchChatData()
        setActiveChannel(data.channel)
        fetchMessages(data.channel.id)
      } else {
        throw new Error('Failed to create chat')
      }
    } catch (error) {
      toast.error('Failed to create chat')
    }
  }

  const getChannelName = (channel: ChatChannel) => {
    if (channel.name) return channel.name
    if (channel.type === 'DIRECT') {
      const otherMember = channel.members.find(m => m.id !== session?.user?.id)
      return otherMember?.name || 'Direct Message'
    }
    return 'Unnamed Channel'
  }

  const getChannelIcon = (channel: ChatChannel) => {
    switch (channel.type) {
      case 'DIRECT': return <AtSign className="h-4 w-4" />
      case 'GROUP': return <Users className="h-4 w-4" />
      case 'DEPARTMENT': return <Hash className="h-4 w-4" />
      case 'PROJECT': return <Hash className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  const filteredChannels = channels.filter(channel =>
    getChannelName(channel).toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    user.id !== session?.user?.id
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Messages</h2>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleCreateDirectMessage(user.id)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                        >
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.role.replace('_', ' ')} • {user.department}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => handleChannelSelect(channel)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                  activeChannel?.id === channel.id && "bg-accent"
                )}
              >
                <div className="relative">
                  {channel.type === 'DIRECT' ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={channel.members.find(m => m.id !== session?.user?.id)?.avatar} />
                      <AvatarFallback>
                        {channel.members.find(m => m.id !== session?.user?.id)?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getChannelIcon(channel)}
                    </div>
                  )}
                  {channel.type === 'DIRECT' && channel.members.find(m => m.id !== session?.user?.id)?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {getChannelName(channel)}
                    </p>
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {channel.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate">
                      {channel.lastMessage.author.name}: {channel.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            {/* Chat Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {activeChannel.type === 'DIRECT' ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activeChannel.members.find(m => m.id !== session?.user?.id)?.avatar} />
                      <AvatarFallback>
                        {activeChannel.members.find(m => m.id !== session?.user?.id)?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getChannelIcon(activeChannel)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{getChannelName(activeChannel)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeChannel.type === 'DIRECT' 
                        ? (activeChannel.members.find(m => m.id !== session?.user?.id)?.isOnline ? 'Online' : 'Offline')
                        : `${activeChannel.members.length} members`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.author.avatar} />
                      <AvatarFallback>{message.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      {message.replyTo && (
                        <div className="text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-muted">
                          Replying to {message.replyTo.author.name}: {message.replyTo.content}
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      {message.reactions.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {message.reactions.map((reaction, index) => (
                            <Button key={index} variant="ghost" size="sm" className="h-6 px-2">
                              {reaction.emoji} {reaction.users.length}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-[#0B874E] hover:bg-[#0B874E]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground mb-4">
                Choose a conversation from the sidebar or start a new chat
              </p>
              <Button onClick={() => setIsNewChatOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}