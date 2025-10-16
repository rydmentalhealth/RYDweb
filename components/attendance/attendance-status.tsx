'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Loader2,
  MapPin
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface UserStatus {
  id: string
  name: string
  email: string
  avatar?: string
  department?: string
  jobTitle?: string
  status: 'ACTIVE' | 'ON_LEAVE' | 'OFFLINE' | 'LATE'
  checkIn?: {
    checkInTime: string
    workingHours?: number
    location?: string
  }
}

interface AttendanceStatusData {
  date: string
  stats: {
    total: number
    active: number
    onLeave: number
    offline: number
    late: number
    attendanceRate: number
  }
  users: UserStatus[]
}

export function AttendanceStatus() {
  const [data, setData] = useState<AttendanceStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAttendanceStatus()
  }, [])

  const fetchAttendanceStatus = async () => {
    try {
      const response = await fetch('/api/attendance/status')
      if (response.ok) {
        const statusData = await response.json()
        setData(statusData)
      } else {
        throw new Error('Failed to fetch')
      }
    } catch (error) {
      toast.error('Failed to load attendance status')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = data?.users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'ON_LEAVE':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'LATE':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-600">Active</Badge>
      case 'ON_LEAVE':
        return <Badge variant="default" className="bg-blue-600">On Leave</Badge>
      case 'LATE':
        return <Badge variant="default" className="bg-orange-600">Late</Badge>
      default:
        return <Badge variant="secondary">Offline</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          Failed to load attendance status
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data.stats.onLeave}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.stats.late}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{data.stats.offline}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Status List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Attendance Status
          </CardTitle>
          <CardDescription>
            Real-time attendance status for {format(new Date(data.date), 'MMMM d, yyyy')} • 
            {data.stats.attendanceRate}% attendance rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-l-4" style={{
                borderLeftColor: user.status === 'ACTIVE' ? '#16a34a' : 
                                user.status === 'ON_LEAVE' ? '#2563eb' :
                                user.status === 'LATE' ? '#ea580c' : '#9ca3af'
              }}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{user.name}</h4>
                        {getStatusBadge(user.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{user.email}</span>
                        {user.department && (
                          <>
                            <span>•</span>
                            <span>{user.department}</span>
                          </>
                        )}
                        {user.jobTitle && (
                          <>
                            <span>•</span>
                            <span>{user.jobTitle}</span>
                          </>
                        )}
                      </div>
                      {user.checkIn && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Checked in at {format(new Date(user.checkIn.checkInTime), 'h:mm a')}
                          </span>
                          {user.checkIn.workingHours && (
                            <span>{user.checkIn.workingHours.toFixed(1)}h worked</span>
                          )}
                          {user.checkIn.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.checkIn.location.substring(0, 20)}...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No team members found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
