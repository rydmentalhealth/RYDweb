'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Search, Calendar, Mail, Phone, User, Building2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvailableUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  fullName: string
  role: string
  avatar?: string
  phone?: string
  department?: string
  jobTitle?: string
  createdAt: string
  approvedAt?: string
}

interface AddEmployeeDialogProps {
  onEmployeeAdded?: () => void
}

export function AddEmployeeDialog({ onEmployeeAdded }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    supervisorId: '',
    employmentType: 'FULL_TIME',
    startDate: new Date().toISOString().split('T')[0],
    bio: ''
  })

  // Fetch available users when dialog opens
  useEffect(() => {
    if (open) {
      fetchAvailableUsers()
    }
  }, [open])

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users/available-for-employee')
      if (!response.ok) {
        throw new Error('Failed to fetch available users')
      }
      const data = await response.json()
      setAvailableUsers(data.users)
    } catch (error) {
      console.error('Error fetching available users:', error)
      toast.error('Failed to load available users')
    }
  }

  const filteredUsers = availableUsers.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleUserSelect = (user: AvailableUser) => {
    setSelectedUser(user)
    // Pre-fill form with user data if available
    setFormData(prev => ({
      ...prev,
      department: user.department || '',
      designation: user.jobTitle || ''
    }))
  }

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to add as employee')
      return
    }

    if (!formData.department || !formData.designation) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          phone: selectedUser.phone,
          department: formData.department,
          designation: formData.designation,
          supervisorId: formData.supervisorId || undefined,
          employmentType: formData.employmentType,
          startDate: formData.startDate,
          bio: formData.bio
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create employee')
      }

      const employee = await response.json()
      toast.success(`Successfully added ${employee.fullName} as an employee`)
      
      // Reset form and close dialog
      setSelectedUser(null)
      setFormData({
        department: '',
        designation: '',
        supervisorId: '',
        employmentType: 'FULL_TIME',
        startDate: new Date().toISOString().split('T')[0],
        bio: ''
      })
      setOpen(false)
      
      // Callback to refresh parent component
      if (onEmployeeAdded) {
        onEmployeeAdded()
      }
      
    } catch (error) {
      console.error('Error creating employee:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create employee')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Select an active system user and add them to the employee directory with their role and department information.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Selection Panel */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search System Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    {availableUsers.length === 0 
                      ? 'No active users available to add as employees'
                      : 'No users match your search criteria'
                    }
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((user) => (
                  <Card 
                    key={user.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium truncate">{user.fullName}</p>
                            <Badge variant="outline" className="text-xs">
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                          {user.department && (
                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                              <Building2 className="h-3 w-3 mr-1" />
                              {user.department}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Employee Details Form */}
          <div className="space-y-4">
            <div>
              <Label>Selected User</Label>
              {selectedUser ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedUser.avatar} />
                        <AvatarFallback>
                          {getInitials(selectedUser.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{selectedUser.fullName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    Select a user from the list to continue
                  </CardContent>
                </Card>
              )}
            </div>

            {selectedUser && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Therapy">Therapy</SelectItem>
                        <SelectItem value="Outreach">Outreach</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Administration">Administration</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Input
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                      placeholder="e.g., Therapist, Coordinator"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select value={formData.employmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                        <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                        <SelectItem value="INTERN">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Brief description of the employee's background and expertise..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedUser || loading}>
            {loading ? 'Creating...' : 'Add Employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}