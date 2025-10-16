'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Clock, 
  MapPin, 
  LogIn,
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface CheckInOutCardProps {
  checkInStatus: any
  onCheckInOut: () => void
}

export function CheckInOutCard({ checkInStatus, onCheckInOut }: CheckInOutCardProps) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [enableLocation, setEnableLocation] = useState(true)
  const [location, setLocation] = useState<GeolocationPosition | null>(null)

  const isCheckedIn = checkInStatus && !checkInStatus.checkOutTime

  const getLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    })
  }

  const handleCheckIn = async () => {
    setLoading(true)
    
    try {
      let locationData: any = {}
      
      if (enableLocation) {
        try {
          const position = await getLocation()
          setLocation(position)
          locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          }
          toast.success('Location captured successfully')
        } catch (error) {
          toast.warning('Could not get location, continuing without it')
        }
      }

      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-in',
          notes,
          ...locationData,
          deviceInfo: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check in')
      }

      toast.success('Checked in successfully! Have a productive day! 🎉')
      setNotes('')
      onCheckInOut()
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-out',
          notes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to check out')
      }

      const data = await response.json()
      toast.success(
        `Checked out successfully! You worked ${data.workingHours?.toFixed(1)} hours today. Great job! 👏`
      )
      setNotes('')
      onCheckInOut()
    } catch (error: any) {
      toast.error(error.message || 'Failed to check out')
    } finally {
      setLoading(false)
    }
  }

  const getWorkingHours = () => {
    if (!checkInStatus?.checkInTime) return 0
    const now = new Date()
    const checkIn = new Date(checkInStatus.checkInTime)
    return (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={isCheckedIn ? 'border-green-500 bg-green-50/50' : 'border-blue-500 bg-blue-50/50'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isCheckedIn ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Currently Checked In
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-blue-600" />
                    Ready to Check In
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {isCheckedIn ? (
                  `Since ${format(new Date(checkInStatus.checkInTime), 'h:mm a')}`
                ) : (
                  'Start tracking your work time'
                )}
              </CardDescription>
            </div>
            <Badge variant={isCheckedIn ? 'default' : 'secondary'} className="text-sm">
              {isCheckedIn ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCheckedIn && (
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Working Hours</span>
                <span className="text-2xl font-bold text-green-600">
                  {getWorkingHours().toFixed(1)}h
                </span>
              </div>
              {checkInStatus.location && (
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{checkInStatus.location}</span>
                </div>
              )}
            </div>
          )}

          {!isCheckedIn && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <Label htmlFor="enable-location" className="flex items-center gap-2 cursor-pointer">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Enable Geolocation</span>
              </Label>
              <Switch
                id="enable-location"
                checked={enableLocation}
                onCheckedChange={setEnableLocation}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder={
                isCheckedIn
                  ? 'Add any end-of-day notes...'
                  : 'What are you planning to work on today?'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={loading}
            className="w-full"
            size="lg"
            variant={isCheckedIn ? 'destructive' : 'default'}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isCheckedIn ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Check Out
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Check In
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Attendance Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Check in when you start work</p>
                <p className="text-sm text-muted-foreground">
                  Remote or in-office, always log your start time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Location tracking is optional</p>
                <p className="text-sm text-muted-foreground">
                  Enable it for better attendance verification
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Remember to check out</p>
                <p className="text-sm text-muted-foreground">
                  Your working hours are calculated automatically
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Log your daily tasks</p>
                <p className="text-sm text-muted-foreground">
                  Use the Task Logs tab to record what you worked on
                </p>
              </div>
            </div>
          </div>

          {checkInStatus && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Last Activity
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Checked in at {format(new Date(checkInStatus.checkInTime), 'MMMM d, yyyy h:mm a')}
              </p>
              {checkInStatus.notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  "{checkInStatus.notes}"
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
