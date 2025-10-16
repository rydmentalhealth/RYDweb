"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  FileText, 
  Users, 
  Filter, 
  Calendar,
  Building2,
  UserCheck,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface OrganizationMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  status: string
  joinDate: Date
  employeeId: string
  phoneNumber?: string
  position?: string
}

// Mock data - replace with real API calls
const mockMembers: OrganizationMember[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Nakato',
    email: 'sarah.nakato@ryd.org',
    role: 'STAFF',
    department: 'Mental Health Services',
    status: 'ACTIVE',
    joinDate: new Date('2023-01-15'),
    employeeId: 'RYD-MH-001',
    phoneNumber: '+256 700 123 456',
    position: 'Senior Counselor'
  },
  {
    id: '2',
    firstName: 'James',
    lastName: 'Okello',
    email: 'james.okello@ryd.org',
    role: 'TEAM_LEAD',
    department: 'Community Outreach',
    status: 'ACTIVE',
    joinDate: new Date('2022-08-20'),
    employeeId: 'RYD-CO-001',
    phoneNumber: '+256 700 234 567',
    position: 'Community Liaison Lead'
  },
  {
    id: '3',
    firstName: 'Grace',
    lastName: 'Namuli',
    email: 'grace.namuli@ryd.org',
    role: 'STAFF',
    department: 'Youth Programs',
    status: 'ACTIVE',
    joinDate: new Date('2023-03-10'),
    employeeId: 'RYD-YP-001',
    phoneNumber: '+256 700 345 678',
    position: 'Youth Coordinator'
  },
  {
    id: '4',
    firstName: 'Peter',
    lastName: 'Ssali',
    email: 'peter.ssali@ryd.org',
    role: 'VOLUNTEER',
    department: 'Volunteer Coordination',
    status: 'ACTIVE',
    joinDate: new Date('2023-06-01'),
    employeeId: 'RYD-VC-001',
    phoneNumber: '+256 700 456 789',
    position: 'Volunteer Coordinator'
  },
  {
    id: '5',
    firstName: 'Mary',
    lastName: 'Achieng',
    email: 'mary.achieng@ryd.org',
    role: 'ADMIN',
    department: 'Human Resources',
    status: 'ACTIVE',
    joinDate: new Date('2022-05-15'),
    employeeId: 'RYD-HR-001',
    phoneNumber: '+256 700 567 890',
    position: 'HR Manager'
  }
]

export function OrganizationIdGenerator() {
  const { data: session } = useSession()
  const [members] = useState<OrganizationMember[]>(mockMembers)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // Filter members based on selected criteria
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchTerm === '' || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || member.role === filterRole
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(members.map(m => m.role)))
  const uniqueDepartments = Array.from(new Set(members.map(m => m.department)))
  const uniqueStatuses = Array.from(new Set(members.map(m => m.status)))

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id))
    }
  }

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const generateIdCards = async (format: 'pdf' | 'png' | 'csv') => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member to generate ID cards')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate ID generation process
      const selectedMemberData = members.filter(m => selectedMembers.includes(m.id))
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Generate the actual file content based on format
      if (format === 'csv') {
        generateCSVDownload(selectedMemberData)
      } else if (format === 'pdf') {
        await generatePDFDownload(selectedMemberData)
      } else if (format === 'png') {
        await generateImageDownload(selectedMemberData)
      }

      toast.success(`Successfully generated ${format.toUpperCase()} file for ${selectedMembers.length} member(s)`)
    } catch (error) {
      toast.error('Failed to generate ID cards. Please try again.')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const generateCSVDownload = (memberData: OrganizationMember[]) => {
    const headers = [
      'Employee ID',
      'Full Name',
      'Email',
      'Role',
      'Department',
      'Position',
      'Phone Number',
      'Status',
      'Join Date'
    ]

    const csvContent = [
      headers.join(','),
      ...memberData.map(member => [
        member.employeeId,
        `"${member.firstName} ${member.lastName}"`,
        member.email,
        member.role,
        `"${member.department}"`,
        `"${member.position || ''}"`,
        member.phoneNumber || '',
        member.status,
        member.joinDate.toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ryd-organization-ids-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generatePDFDownload = async (memberData: OrganizationMember[]) => {
    // In a real implementation, you would use a PDF library like jsPDF or PDFKit
    // For now, we'll create a simple HTML-based PDF simulation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>RYD Organization ID Cards</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .id-card { 
              border: 2px solid #0B874E; 
              border-radius: 10px; 
              padding: 20px; 
              margin: 20px 0; 
              width: 350px; 
              background: linear-gradient(135deg, #f0f9f4 0%, #ffffff 100%);
              page-break-inside: avoid;
            }
            .header { color: #0B874E; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
            .employee-id { font-size: 16px; font-weight: bold; color: #333; }
            .name { font-size: 20px; font-weight: bold; margin: 10px 0; }
            .details { font-size: 14px; line-height: 1.5; }
            .logo { text-align: center; margin-bottom: 15px; font-size: 24px; color: #0B874E; }
          </style>
        </head>
        <body>
          ${memberData.map(member => `
            <div class="id-card">
              <div class="logo">🏥 RYD</div>
              <div class="header">ORGANIZATION ID CARD</div>
              <div class="employee-id">ID: ${member.employeeId}</div>
              <div class="name">${member.firstName} ${member.lastName}</div>
              <div class="details">
                <div><strong>Role:</strong> ${member.role}</div>
                <div><strong>Department:</strong> ${member.department}</div>
                <div><strong>Position:</strong> ${member.position || 'N/A'}</div>
                <div><strong>Email:</strong> ${member.email}</div>
                <div><strong>Phone:</strong> ${member.phoneNumber || 'N/A'}</div>
                <div><strong>Join Date:</strong> ${member.joinDate.toLocaleDateString()}</div>
                <div><strong>Status:</strong> ${member.status}</div>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ryd-id-cards-${new Date().toISOString().split('T')[0]}.html`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateImageDownload = async (memberData: OrganizationMember[]) => {
    // In a real implementation, you would use Canvas API or a library like html2canvas
    // For now, we'll create a simple text file with ID card data
    const textContent = memberData.map(member => `
RYD ORGANIZATION ID CARD
========================
ID: ${member.employeeId}
Name: ${member.firstName} ${member.lastName}
Role: ${member.role}
Department: ${member.department}
Position: ${member.position || 'N/A'}
Email: ${member.email}
Phone: ${member.phoneNumber || 'N/A'}
Join Date: ${member.joinDate.toLocaleDateString()}
Status: ${member.status}
========================
    `).join('\n\n')

    const blob = new Blob([textContent], { type: 'text/plain' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ryd-id-cards-${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organization ID Generator</h2>
          <p className="text-muted-foreground">Generate and download organization ID cards for team members</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {filteredMembers.length} member(s) • {selectedMembers.length} selected
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
          <CardDescription>Filter members by role, department, or search by name/email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setFilterRole('all')
                  setFilterDepartment('all')
                  setFilterStatus('all')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Members
              </CardTitle>
              <CardDescription>Choose which members to include in the ID generation</CardDescription>
            </div>
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Checkbox
                  id={member.id}
                  checked={selectedMembers.includes(member.id)}
                  onCheckedChange={() => handleSelectMember(member.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.firstName} {member.lastName}</span>
                    <Badge variant="secondary" className="text-xs">{member.role}</Badge>
                    <Badge 
                      variant={member.status === 'ACTIVE' ? 'default' : 'secondary'} 
                      className={`text-xs ${member.status === 'ACTIVE' ? 'bg-green-600' : ''}`}
                    >
                      {member.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.employeeId} • {member.department} • {member.email}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating ID Cards...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={generationProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Processing {selectedMembers.length} member(s)... {generationProgress}%
            </p>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Options
          </CardTitle>
          <CardDescription>Choose your preferred format for the organization ID cards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => generateIdCards('pdf')}
              disabled={selectedMembers.length === 0 || isGenerating}
              className="h-auto p-6 flex flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-medium">PDF Format</span>
              <span className="text-xs text-muted-foreground">Printable ID cards</span>
            </Button>
            
            <Button
              onClick={() => generateIdCards('png')}
              disabled={selectedMembers.length === 0 || isGenerating}
              className="h-auto p-6 flex flex-col gap-2"
              variant="outline"
            >
              <Building2 className="h-8 w-8" />
              <span className="font-medium">Image Format</span>
              <span className="text-xs text-muted-foreground">Digital ID cards</span>
            </Button>
            
            <Button
              onClick={() => generateIdCards('csv')}
              disabled={selectedMembers.length === 0 || isGenerating}
              className="h-auto p-6 flex flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-medium">CSV Format</span>
              <span className="text-xs text-muted-foreground">Data export</span>
            </Button>
          </div>
          
          {selectedMembers.length === 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">Please select at least one member to enable downloads</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}