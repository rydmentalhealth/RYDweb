"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  MessageCircle, 
  Megaphone, 
  Pin, 
  Users, 
  Search,
  Plus,
  Bell,
  Settings,
  Hash,
  AtSign,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Sad
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

// Types
interface Channel {
  id: string
  name?: string
  type: 'DIRECT' | 'GROUP' | 'DEPARTMENT' | 'PROJECT' | 'ANNOUNCEMENT'
  unreadCount: number
  lastMessage?: {
    id: string
    content: string
    author: {
      name: string
      avatar?: string
    }
    createdAt: string
  }
  members: Array<{
    user: {
      id: string
      name: string
      avatar?: string
      role: string
    }
  }>
  department?: {
    name: string
    color: string
  }
}

interface Message {
  id: string
  content: string
  messageType: string
  author: {
    id: string
    name: string
    avatar?: string
    role: string
  }
  createdAt: string
  reactions: Array<{
    emoji: string
    user: {
      id: string
      name: string
    }
  }>
  replyTo?: {
    id: string
    content: string
    author: {
      name: string
    }
  }
}

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  priority: string
  author: {
    name: string
    avatar?: string
    role: string
  }
  createdAt: string
  isPinned: boolean
  reactions: Array<{
    emoji: string
    user: {
      name: string
    }
  }>
  _count: {
    comments: number
    views: number
  }
}

export function CommunicationHub() {
  const [activeTab, setActiveTab] = useState("newsfeed")
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const queryClient = useQueryClient()

  // Handle URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const channelParam = urlParams.get('channel')
      const tabParam = urlParams.get('tab')
      
      if (channelParam) {
        setSelectedChannel(channelParam)
      }
      if (tabParam) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  // Fetch channels
  const { data: channelsData } = useQuery({
    queryKey: ['communication', 'channels'],
    queryFn: async () => {
      const response = await fetch('/api/communication/channels')
      if (!response.ok) throw new Error('Failed to fetch channels')
      return response.json()
    },
  })

  // Fetch announcements
  const { data: announcementsData } = useQuery({
    queryKey: ['communication', 'announcements'],
    queryFn: async () => {
      const response = await fetch('/api/communication/announcements')
      if (!response.ok) throw new Error('Failed to fetch announcements')
      return response.json()
    },
  })

  // Fetch messages for selected channel
  const { data: messagesData } = useQuery({
    queryKey: ['communication', 'messages', selectedChannel],
    queryFn: async () => {
      if (!selectedChannel) return null
      const response = await fetch(`/api/communication/channels/${selectedChannel}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      return response.json()
    },
    enabled: !!selectedChannel,
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; channelId: string }) => {
      const response = await fetch(`/api/communication/channels/${data.channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content }),
      })
      if (!response.ok) throw new Error('Failed to send message')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communication', 'messages', selectedChannel] })
      queryClient.invalidateQueries({ queryKey: ['communication', 'channels'] })
      setMessageInput("")
    },
    onError: () => {
      toast.error("Failed to send message")
    },
  })

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return
    sendMessageMutation.mutate({
      content: messageInput,
      channelId: selectedChannel,
    })
  }

  const channels = channelsData?.channels || []
  const announcements = announcementsData?.announcements || []
  const messages = messagesData?.messages || []

  // Filter channels based on search
  const filteredChannels = channels.filter((channel: Channel) =>
    channel.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.members.some(member => 
      member.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const getChannelName = (channel: Channel) => {
    if (channel.name) return channel.name
    if (channel.type === 'DIRECT') {
      // For DMs, show the other person's name
      return channel.members.find(m => m.user.id !== 'current-user')?.user.name || 'Direct Message'
    }
    return 'Unnamed Channel'
  }

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'DIRECT': return <AtSign className="h-4 w-4" />
      case 'GROUP': return <Users className="h-4 w-4" />
      case 'DEPARTMENT': return <Hash className="h-4 w-4" />
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RYD Connect Center</h1>
            <p className="text-sm text-muted-foreground">
              Stay connected with your team and organization
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b px-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="newsfeed" className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Newsfeed
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="bulletins" className="flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Bulletins
              </TabsTrigger>
              <TabsTrigger value="polls" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Polls
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {/* Newsfeed Tab */}
            <TabsContent value="newsfeed" className="h-full m-0">
              <div className="h-full flex">
                {/* Announcements Feed */}
                <div className="flex-1 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Organization Updates</h2>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Announcement
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-4">
                      {announcements.map((announcement: Announcement) => (
                        <Card key={announcement.id} className={cn(
                          "transition-all hover:shadow-md",
                          announcement.isPinned && "border-primary bg-primary/5"
                        )}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={announcement.author.avatar} />
                                  <AvatarFallback>
                                    {announcement.author.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{announcement.author.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {announcement.author.role} • {new Date(announcement.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {announcement.isPinned && (
                                  <Badge variant="secondary">
                                    <Pin className="h-3 w-3 mr-1" />
                                    Pinned
                                  </Badge>
                                )}
                                <Badge variant={
                                  announcement.priority === 'URGENT' ? 'destructive' :
                                  announcement.priority === 'HIGH' ? 'default' : 'secondary'
                                }>
                                  {announcement.priority}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h3 className="font-semibold mb-2">{announcement.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {announcement.content}
                            </p>
                            
                            {/* Engagement Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {announcement.reactions.length}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  {announcement._count.comments}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  {announcement._count.views} views
                                </span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Sidebar */}
                <div className="w-80 border-l bg-muted/30 p-4">
                  <div className="space-y-4">
                    {/* Quick Actions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Announcement
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Users className="h-4 w-4 mr-2" />
                          Start Poll
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          New Group Chat
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-muted-foreground">5 new messages in #general</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-muted-foreground">New poll: Team lunch preferences</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                            <span className="text-muted-foreground">Bulletin updated: HR Policies</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat" className="h-full m-0">
              <div className="h-full flex">
                {/* Channels Sidebar */}
                <div className="w-80 border-r bg-muted/30 flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold">Channels</h2>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search channels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="p-2">
                      {filteredChannels.map((channel: Channel) => (
                        <div
                          key={channel.id}
                          onClick={() => setSelectedChannel(channel.id)}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                            selectedChannel === channel.id && "bg-accent"
                          )}
                        >
                          <div className="flex-shrink-0">
                            {getChannelIcon(channel)}
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
                                {channel.lastMessage.content}
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
                  {selectedChannel ? (
                    <>
                      {/* Chat Header */}
                      <div className="border-b p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {getChannelName(channels.find((c: Channel) => c.id === selectedChannel))}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {channels.find((c: Channel) => c.id === selectedChannel)?.members.length} members
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Messages */}
                      <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                          {messages.map((message: Message) => (
                            <div key={message.id} className="flex space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.author.avatar} />
                                <AvatarFallback>
                                  {message.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium">{message.author.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(message.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                {message.replyTo && (
                                  <div className="text-xs text-muted-foreground mb-1 pl-3 border-l-2 border-muted">
                                    Replying to {message.replyTo.author.name}: {message.replyTo.content}
                                  </div>
                                )}
                                <p className="text-sm">{message.content}</p>
                                {message.reactions.length > 0 && (
                                  <div className="flex items-center space-x-1 mt-2">
                                    {message.reactions.map((reaction, index) => (
                                      <Button key={index} variant="ghost" size="sm" className="h-6 px-2">
                                        {reaction.emoji} 1
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="border-t p-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Type a message..."
                              value={messageInput}
                              onChange={(e) => setMessageInput(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="pr-20"
                            />
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
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
                            disabled={!messageInput.trim() || sendMessageMutation.isPending}
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
                        <h3 className="text-lg font-semibold mb-2">Select a channel</h3>
                        <p className="text-muted-foreground">
                          Choose a channel from the sidebar to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Bulletins Tab */}
            <TabsContent value="bulletins" className="h-full m-0">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Departmental Bulletins</h2>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Bulletin
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Bulletin boards will be rendered here */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">HR Department</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Important updates and policies from HR
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          📌 New leave policy effective Jan 1st
                        </div>
                        <div className="text-xs text-muted-foreground">
                          📋 Performance review schedule
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Polls Tab */}
            <TabsContent value="polls" className="h-full m-0">
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Polls & Surveys</h2>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Poll
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Polls will be rendered here */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Team Lunch Preferences</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Help us decide on the menu for next Friday's team lunch
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Pizza & Italian</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-3/4 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm text-muted-foreground">15 votes</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">Chinese Cuisine</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div className="w-1/2 bg-primary h-2 rounded-full"></div>
                            </div>
                            <span className="text-sm text-muted-foreground">10 votes</span>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Vote Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}