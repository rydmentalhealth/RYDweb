"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataTable } from "@/components/data-table"
import { 
  Settings, 
  User, 
  Shield, 
  Activity, 
  Bell, 
  Palette, 
  Globe, 
  Lock, 
  Users, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: string
  avatar?: string
  lastLogin?: string
}

interface SystemLog {
  id: string
  action: string
  user: string
  resource: string
  timestamp: string
  ipAddress: string
  status: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  chatMessages: boolean
  taskUpdates: boolean
  announcements: boolean
}

interface GeneralSettings {
  organizationName: string
  timezone: string
  language: string
  theme: string
  maintenanceMode: boolean
}

export function SettingsDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    chatMessages: true,
    taskUpdates: true,
    announcements: true
  })
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    organizationName: "RYD Mental Health",
    timezone: "Africa/Kampala",
    language: "en",
    theme: "light",
    maintenanceMode: false
  })

  const userRole = session?.user?.role || 'VOLUNTEER'
  
  // Role-based access control
  const canManageUsers = ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER'].includes(userRole)
  const canManageSystem = ['SUPER_ADMIN', 'ADMIN'].includes(userRole)
  const canViewLogs = ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER'].includes(userRole)
  const canManageRoles = ['SUPER_ADMIN'].includes(userRole)

  useEffect(() => {
    fetchSettingsData()
  }, [])

  const fetchSettingsData = async () => {
    try {
      setLoading(true)
      
      // Fetch data based on permissions
      const promises = []
      
      if (canManageUsers) {
        promises.push(fetch('/api/admin/users').then(res => res.ok ? res.json() : { users: [] }))
      }
      
      if (canViewLogs) {
        promises.push(fetch('/api/security/audit-logs?limit=50').then(res => res.ok ? res.json() : { logs: [] }))
      }

      const results = await Promise.all(promises)
      
      if (canManageUsers && results[0]) {
        setUsers(results[0].users || [])
      }
      
      if (canViewLogs && results[canManageUsers ? 1 : 0]) {
        setSystemLogs(results[canManageUsers ? 1 : 0].logs || [])
      }
      
    } catch (error) {
      console.error('Error fetching settings data:', error)
      toast.error('Failed to load settings data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotificationSettings = async () => {
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationSettings)
      })

      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success('Notification settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save notification settings')
    }
  }

  const handleSaveGeneralSettings = async () => {
    if (!canManageSystem) {
      toast.error('Insufficient permissions')
      return
    }

    try {
      const response = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generalSettings)
      })

      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success('General settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save general settings')
    }
  }

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    if (!canManageUsers) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update user status')
      
      toast.success('User status updated successfully!')
      fetchSettingsData()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'SUSPENDED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'HR_OFFICER': return 'bg-indigo-100 text-indigo-800'
      case 'TEAM_LEAD': return 'bg-green-100 text-green-800'
      case 'STAFF': return 'bg-orange-100 text-orange-800'
      case 'VOLUNTEER': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, system configurations, and organizational settings
        </p>
      </div>

      {/* Role-based tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          {canManageUsers && (
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          )}
          {canManageSystem && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          )}
          {canViewLogs && (
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal information and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session?.user?.image || ''} />
                  <AvatarFallback className="text-lg">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    defaultValue={session?.user?.name || ''} 
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={session?.user?.email || ''} 
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={userRole.replace('_', ' ')} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    defaultValue={session?.user?.department || 'Not assigned'} 
                    placeholder="Department"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chat Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new chat messages
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.chatMessages}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, chatMessages: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about task assignments and updates
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.taskUpdates}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, taskUpdates: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Announcements</Label>
                    <p className="text-sm text-muted-foreground">
                      Important organizational announcements
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.announcements}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, announcements: checked }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotificationSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management (Admin/HR only) */}
        {canManageUsers && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Search users..." className="w-64" />
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Department</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Last Login</th>
                            <th className="text-left p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="p-4">{user.department || 'Not assigned'}</td>
                              <td className="p-4">
                                <Badge className={getStatusColor(user.status)}>
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, yyyy') : 'Never'}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {canManageRoles && (
                                    <Button variant="ghost" size="sm" className="text-red-600">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* System Settings (Super Admin/Admin only) */}
        {canManageSystem && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Manage system-wide settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Changes to system settings affect all users. Please proceed with caution.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input 
                      id="orgName" 
                      value={generalSettings.organizationName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, organizationName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={generalSettings.timezone}
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Kampala">Africa/Kampala (UTC+3)</SelectItem>
                        <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      value={generalSettings.language}
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                        <SelectItem value="lg">Luganda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Default Theme</Label>
                    <Select 
                      value={generalSettings.theme}
                      onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, theme: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable access for system maintenance
                      </p>
                    </div>
                    <Switch 
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => 
                        setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneralSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Audit Logs (Admin/HR only) */}
        {canViewLogs && (
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Audit Logs
                </CardTitle>
                <CardDescription>
                  Monitor system activity and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Search logs..." className="w-64" />
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Actions</SelectItem>
                          <SelectItem value="login">Login</SelectItem>
                          <SelectItem value="create">Create</SelectItem>
                          <SelectItem value="update">Update</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Logs
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-medium">Timestamp</th>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Action</th>
                            <th className="text-left p-4 font-medium">Resource</th>
                            <th className="text-left p-4 font-medium">IP Address</th>
                            <th className="text-left p-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {systemLogs.map((log) => (
                            <tr key={log.id} className="border-b">
                              <td className="p-4 text-sm">
                                {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                              </td>
                              <td className="p-4 font-medium">{log.user}</td>
                              <td className="p-4">
                                <Badge variant="outline">{log.action}</Badge>
                              </td>
                              <td className="p-4">{log.resource}</td>
                              <td className="p-4 text-sm text-muted-foreground">{log.ipAddress}</td>
                              <td className="p-4">
                                <Badge className={
                                  log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                                  log.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'
                                }>
                                  {log.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}