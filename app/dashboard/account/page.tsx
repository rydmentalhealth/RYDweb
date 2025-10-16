"use client"

import { Metadata } from "next"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, User, Shield, Bell, Camera } from "lucide-react"

interface UserProfile {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  location?: string
  district?: string
  region?: string
  languages?: string
  skills?: string
  emergencyContact?: string
  availability?: string
  role: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    district: '',
    region: '',
    languages: '',
    skills: '',
    emergencyContact: '',
    availability: 'FULL_TIME'
  })

  // Fetch user profile
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          district: data.district || '',
          region: data.region || '',
          languages: data.languages || '',
          skills: data.skills || '',
          emergencyContact: data.emergencyContact || '',
          availability: data.availability || 'FULL_TIME'
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        toast.success('Profile updated successfully')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session || !profile) {
    return (
      <div className="text-center py-8">
        <p>Unable to load profile. Please try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and account security.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">
                  {profile.name || `${profile.firstName} ${profile.lastName}`}
                </h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{profile.role}</Badge>
                  <Badge variant={profile.status === 'ACTIVE' ? 'default' : 'destructive'}>
                    {profile.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="ON_CALL">On Call</SelectItem>
                    <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  placeholder="e.g., English, Luganda, Swahili"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  placeholder="e.g., Counseling, Project Management, Data Analysis"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>
              View your account details and security information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-sm text-muted-foreground">{profile.status}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive notifications and updates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notification preferences will be available soon. You'll be able to customize email, push, and in-app notifications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 