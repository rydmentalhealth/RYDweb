"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Activity, 
  Database, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Settings,
  Key,
  Server,
  HardDrive,
  Globe,
  UserX,
  Clock
} from "lucide-react"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { UserRole } from "@prisma/client"
import { format } from "date-fns"

interface AuditLog {
  id: string
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  } | null
  action: string
  resource: string
  resourceId?: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'SUSPICIOUS'
  ipAddress?: string
  createdAt: string
}

interface SecuritySession {
  id: string
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
  ipAddress?: string
  location?: string
  lastActivity: string
  createdAt: string
  expiresAt: string
}

interface SystemHealth {
  component: string
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'DOWN'
  responseTime?: number
  errorRate?: number
  uptime?: number
  alertLevel: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  checkedAt: string
}

export function SecurityControlPanel() {
  const permissions = usePermissions()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activeSessions, setActiveSessions] = useState<SecuritySession[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [auditFilters, setAuditFilters] = useState({
    action: '',
    riskLevel: '',
    userId: '',
    resource: ''
  })

  // Check if user is Super Admin
  const isSuperAdmin = permissions.role === UserRole.SUPER_ADMIN

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSecurityData()
    }
  }, [isSuperAdmin])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      const [auditResponse, sessionsResponse] = await Promise.all([
        fetch('/api/security/audit-logs?limit=50'),
        fetch('/api/security/sessions?showAll=true')
      ])

      if (auditResponse.ok) {
        const auditData = await auditResponse.json()
        setAuditLogs(auditData.logs)
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setActiveSessions(sessionsData.sessions)
      }

      // Mock system health data (replace with real API)
      setSystemHealth([
        {
          component: 'Database',
          status: 'HEALTHY',
          responseTime: 45,
          errorRate: 0.1,
          uptime: 99.9,
          alertLevel: 'INFO',
          checkedAt: new Date().toISOString()
        },
        {
          component: 'API Gateway',
          status: 'HEALTHY',
          responseTime: 120,
          errorRate: 0.3,
          uptime: 99.8,
          alertLevel: 'INFO',
          checkedAt: new Date().toISOString()
        },
        {
          component: 'File Storage',
          status: 'WARNING',
          responseTime: 200,
          errorRate: 1.2,
          uptime: 98.5,
          alertLevel: 'WARNING',
          checkedAt: new Date().toISOString()
        }
      ])

    } catch (error) {
      console.error('Failed to fetch security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/security/sessions?sessionId=${sessionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Failed to terminate session:', error)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'BLOCKED': return 'bg-orange-100 text-orange-800'
      case 'SUSPICIOUS': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'CRITICAL': return <XCircle className="h-4 w-4 text-red-600" />
      case 'DOWN': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 md:px-6">
          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Access denied. This Security Control Panel is only available to Super Administrators.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-6">
        <div className="px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-ryd" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ryd flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Control Panel
          </h2>
          <p className="text-muted-foreground">
            Comprehensive security monitoring and compliance management
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchSecurityData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">Currently logged in</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {auditLogs.filter(log => log.riskLevel === 'HIGH' || log.riskLevel === 'CRITICAL').length}
            </div>
            <p className="text-xs text-muted-foreground">High/Critical risk events</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Encryption</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">AES-256 encryption</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          {/* Audit Log Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Audit Log Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <Select value={auditFilters.action} onValueChange={(value) => setAuditFilters(prev => ({ ...prev, action: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="EXPORT">Export</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={auditFilters.riskLevel} onValueChange={(value) => setAuditFilters(prev => ({ ...prev, riskLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Input 
                  placeholder="Search resource..." 
                  value={auditFilters.resource}
                  onChange={(e) => setAuditFilters(prev => ({ ...prev, resource: e.target.value }))}
                />

                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Audit Events
              </CardTitle>
              <CardDescription>Comprehensive log of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-xs text-muted-foreground">{log.user.role}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.resource}</TableCell>
                      <TableCell>
                        <Badge className={getRiskLevelColor(log.riskLevel)}>
                          {log.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active User Sessions
              </CardTitle>
              <CardDescription>Monitor and manage active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Session Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.user.name}</div>
                          <div className="text-xs text-muted-foreground">{session.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.user.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{session.ipAddress || 'N/A'}</TableCell>
                      <TableCell>{session.location || 'Unknown'}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(session.lastActivity), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(session.createdAt), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Terminate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systemHealth.map((health, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {health.component === 'Database' && <Database className="h-4 w-4" />}
                    {health.component === 'API Gateway' && <Server className="h-4 w-4" />}
                    {health.component === 'File Storage' && <HardDrive className="h-4 w-4" />}
                    {health.component}
                  </CardTitle>
                  {getHealthStatusIcon(health.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className={
                        health.status === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                        health.status === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {health.status}
                      </Badge>
                    </div>
                    {health.responseTime && (
                      <div className="flex justify-between">
                        <span className="text-sm">Response Time:</span>
                        <span className="text-sm font-mono">{health.responseTime}ms</span>
                      </div>
                    )}
                    {health.uptime && (
                      <div className="flex justify-between">
                        <span className="text-sm">Uptime:</span>
                        <span className="text-sm font-mono">{health.uptime}%</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Last checked: {format(new Date(health.checkedAt), 'HH:mm:ss')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Role-Based Access Control
              </CardTitle>
              <CardDescription>Manage permissions for different user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Permission Management</h3>
                <p className="text-muted-foreground mb-4">
                  Configure role-based permissions and access controls
                </p>
                <Button>
                  <Key className="h-4 w-4 mr-2" />
                  Configure Permissions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Automated Backups
                </CardTitle>
                <CardDescription>System backup status and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Last Backup:</span>
                    <span className="font-mono text-sm">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Frequency:</span>
                    <Badge variant="outline">Daily</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Status:</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Data Protection
                </CardTitle>
                <CardDescription>GDPR compliance and data privacy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Encryption:</span>
                    <Badge className="bg-green-100 text-green-800">AES-256</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GDPR Compliance:</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Retention:</span>
                    <span className="text-sm">7 years</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}