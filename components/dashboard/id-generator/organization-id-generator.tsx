"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  AlertCircle,
  CreditCard,
  MapPin,
  Phone,
  Mail
} from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { format, addMonths } from "date-fns"

interface Employee {
  id: string
  name: string
  email: string
  role: string
  department?: string
  status: string
  createdAt: string
  avatar?: string
  phoneNumber?: string
  position?: string
  employeeProfile?: {
    position?: string
    department?: string
    joinDate?: string
  }
}

// RYD Organization Details
const RYD_CONTACT_INFO = {
  name: "RYD Mental Health",
  address: "Namugongo, Wakiso, Uganda",
  poBox: "P.O. Box 187215 Kampala GPO",
  phone1: "+256 709 039595",
  phone2: "+256 776 803262",
  email: "info@rydmentalhealth.org",
  website: "rydmentalhealth.org"
}

export function OrganizationIdGenerator() {
  const { data: session } = useSession()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  // Generate RYD ID format: RYD-MMYY-XXX
  const generateRydId = (joinDate: Date, sequence: number): string => {
    const month = String(joinDate.getMonth() + 1).padStart(2, '0')
    const year = String(joinDate.getFullYear()).slice(-2)
    const seq = String(sequence).padStart(3, '0')
    return `RYD-${month}${year}-${seq}`
  }

  // Calculate expiry date (6 months from join date)
  const calculateExpiryDate = (joinDate: Date): Date => {
    return addMonths(joinDate, 6)
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      
      // First try to get from admin/users endpoint
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        // Filter active employees only
        const activeEmployees = usersData?.filter((user: any) => 
          user.status === 'ACTIVE' && 
          ['STAFF', 'TEAM_LEAD', 'ADMIN', 'HR_OFFICER', 'VOLUNTEER', 'SUPER_ADMIN'].includes(user.role)
        ) || []
        
        // Transform to match expected format
        const transformedEmployees = activeEmployees.map((user: any) => ({
          id: user.id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          role: user.role,
          department: user.department || 'General',
          status: user.status,
          createdAt: user.createdAt,
          avatar: user.avatar,
          phoneNumber: user.phone,
          employeeProfile: {
            position: user.jobTitle || user.role?.replace('_', ' '),
            department: user.department,
            joinDate: user.createdAt
          }
        }))
        
        setEmployees(transformedEmployees)
      } else {
        // Fallback to employees endpoint
        const employeesResponse = await fetch('/api/employees')
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json()
          const activeEmployees = employeesData.employees?.filter((emp: any) => 
            emp.user?.status === 'ACTIVE'
          ).map((emp: any) => ({
            id: emp.user.id,
            name: emp.fullName,
            email: emp.user.email || emp.email,
            role: emp.user.role,
            department: emp.department || 'General',
            status: emp.user.status,
            createdAt: emp.user.createdAt,
            avatar: emp.avatar,
            phoneNumber: emp.phone,
            employeeProfile: {
              position: emp.designation || emp.user.role?.replace('_', ' '),
              department: emp.department,
              joinDate: emp.startDate || emp.user.createdAt
            }
          })) || []
          
          setEmployees(activeEmployees)
        } else {
          toast.error('Failed to fetch employee data from both endpoints')
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast.error('Failed to load employee data')
    } finally {
      setLoading(false)
    }
  }

  // Filter employees based on selected criteria
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || employee.role === filterRole
    const matchesDepartment = filterDepartment === 'all' || 
      (employee.department === filterDepartment || employee.employeeProfile?.department === filterDepartment)
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  // Get unique values for filters
  const uniqueRoles = Array.from(new Set(employees.map(e => e.role)))
  const uniqueDepartments = Array.from(new Set(
    employees.map(e => e.department || e.employeeProfile?.department).filter(Boolean)
  ))
  const uniqueStatuses = Array.from(new Set(employees.map(e => e.status)))

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id))
    }
  }

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const generateIdCards = async (format: 'pdf' | 'png' | 'csv') => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee to generate ID cards')
      return
    }

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Get selected employee data with enhanced information
      const selectedEmployeeData = employees.filter(e => selectedEmployees.includes(e.id)).map((employee, index) => {
        const joinDate = employee.employeeProfile?.joinDate ? new Date(employee.employeeProfile.joinDate) : new Date(employee.createdAt)
        const expiryDate = calculateExpiryDate(joinDate)
        const rydId = generateRydId(joinDate, index + 1)
        
        return {
          ...employee,
          rydId,
          joinDate,
          expiryDate,
          department: employee.department || employee.employeeProfile?.department || 'General',
          position: employee.employeeProfile?.position || employee.role.replace('_', ' ')
        }
      })
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setGenerationProgress(i)
        await new Promise(resolve => setTimeout(resolve, 150))
      }

      // Generate the actual file content based on format
      if (format === 'csv') {
        generateCSVDownload(selectedEmployeeData)
      } else if (format === 'pdf') {
        await generateProfessionalPDFDownload(selectedEmployeeData)
      } else if (format === 'png') {
        await generateProfessionalImageDownload(selectedEmployeeData)
      }

      toast.success(`Successfully generated ${format.toUpperCase()} ID cards for ${selectedEmployees.length} employee(s)`)
    } catch (error) {
      console.error('ID generation error:', error)
      toast.error('Failed to generate ID cards. Please try again.')
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }

  const generateCSVDownload = (employeeData: any[]) => {
    const headers = [
      'RYD ID',
      'Full Name',
      'Email',
      'Role',
      'Department',
      'Position',
      'Phone Number',
      'Status',
      'Join Date',
      'Expiry Date'
    ]

    const csvContent = [
      headers.join(','),
      ...employeeData.map(employee => [
        employee.rydId,
        `"${employee.name}"`,
        employee.email,
        employee.role,
        `"${employee.department}"`,
        `"${employee.position}"`,
        employee.phoneNumber || '',
        employee.status,
        format(employee.joinDate, 'yyyy-MM-dd'),
        format(employee.expiryDate, 'yyyy-MM-dd')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ryd-employee-ids-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateProfessionalPDFDownload = async (employeeData: any[]) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>RYD Mental Health - Official ID Cards</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f8fafc;
            }
            
            .id-card { 
              width: 350px;
              height: 220px;
              border: 3px solid #0B874E; 
              border-radius: 15px; 
              margin: 20px auto; 
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              box-shadow: 0 10px 25px rgba(11, 135, 78, 0.15);
              page-break-inside: avoid;
              position: relative;
              overflow: hidden;
            }
            
            .id-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: linear-gradient(135deg, #0B874E 0%, #16A34A 100%);
            }
            
            .header {
              position: relative;
              z-index: 2;
              text-align: center;
              padding: 12px 20px 0;
              color: white;
            }
            
            .logo {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 2px;
            }
            
            .org-name {
              font-size: 10px;
              font-weight: 500;
              opacity: 0.9;
            }
            
            .content {
              padding: 15px 20px 20px;
              position: relative;
              z-index: 2;
            }
            
            .employee-id {
              font-size: 14px;
              font-weight: 600;
              color: #0B874E;
              text-align: center;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            
            .name {
              font-size: 16px;
              font-weight: 700;
              text-align: center;
              margin-bottom: 12px;
              color: #1f2937;
            }
            
            .details {
              font-size: 10px;
              line-height: 1.4;
              color: #4b5563;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            
            .label {
              font-weight: 600;
              color: #374151;
            }
            
            .footer {
              position: absolute;
              bottom: 8px;
              left: 20px;
              right: 20px;
              font-size: 8px;
              color: #6b7280;
              text-align: center;
              border-top: 1px solid #e5e7eb;
              padding-top: 5px;
            }
            
            .contact-info {
              font-size: 7px;
              line-height: 1.2;
            }
            
            .expiry {
              position: absolute;
              top: 65px;
              right: 15px;
              background: #fef3c7;
              color: #92400e;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 8px;
              font-weight: 600;
            }
            
            @media print {
              body { background: white; }
              .id-card { 
                box-shadow: none; 
                margin: 10px auto;
              }
            }
          </style>
        </head>
        <body>
          ${employeeData.map(employee => `
            <div class="id-card">
              <div class="header">
                <div class="logo">🏥 RYD MENTAL HEALTH</div>
                <div class="org-name">OFFICIAL EMPLOYEE ID</div>
              </div>
              
              <div class="expiry">
                EXP: ${format(employee.expiryDate, 'MM/yy')}
              </div>
              
              <div class="content">
                <div class="employee-id">${employee.rydId}</div>
                <div class="name">${employee.name.toUpperCase()}</div>
                
                <div class="details">
                  <div class="detail-row">
                    <span class="label">Position:</span>
                    <span>${employee.position}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Department:</span>
                    <span>${employee.department}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Role:</span>
                    <span>${employee.role.replace('_', ' ')}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Join Date:</span>
                    <span>${format(employee.joinDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Email:</span>
                    <span>${employee.email}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                <div class="contact-info">
                  <strong>If found, please return to:</strong><br>
                  ${RYD_CONTACT_INFO.address} • ${RYD_CONTACT_INFO.poBox}<br>
                  ${RYD_CONTACT_INFO.phone1} • ${RYD_CONTACT_INFO.phone2}<br>
                  ${RYD_CONTACT_INFO.email} • ${RYD_CONTACT_INFO.website}
                </div>
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
    link.setAttribute('download', `ryd-professional-id-cards-${format(new Date(), 'yyyy-MM-dd')}.html`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateProfessionalImageDownload = async (employeeData: any[]) => {
    // Generate professional ID card data for image format
    const idCardData = employeeData.map(employee => `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           🏥 RYD MENTAL HEALTH                                ║
║                          OFFICIAL EMPLOYEE ID CARD                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  ID: ${employee.rydId.padEnd(20)} │ EXPIRES: ${format(employee.expiryDate, 'MM/yyyy').padEnd(15)} ║
║                                                                               ║
║  NAME: ${employee.name.toUpperCase().padEnd(50)}                         ║
║                                                                               ║
║  POSITION: ${employee.position.padEnd(30)} │ DEPT: ${employee.department.padEnd(20)} ║
║  ROLE: ${employee.role.replace('_', ' ').padEnd(33)} │ STATUS: ${employee.status.padEnd(17)} ║
║                                                                               ║
║  EMAIL: ${employee.email.padEnd(50)}                        ║
║  JOINED: ${format(employee.joinDate, 'MMM dd, yyyy').padEnd(49)}                       ║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                          🔍 IF FOUND, PLEASE RETURN TO:                      ║
║                                                                               ║
║  📍 ${RYD_CONTACT_INFO.address.padEnd(60)}               ║
║  📮 ${RYD_CONTACT_INFO.poBox.padEnd(60)}               ║
║  📞 ${RYD_CONTACT_INFO.phone1} / ${RYD_CONTACT_INFO.phone2.padEnd(40)}        ║
║  📧 ${RYD_CONTACT_INFO.email.padEnd(60)}               ║
║  🌐 ${RYD_CONTACT_INFO.website.padEnd(60)}               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

    `).join('\n\n')

    const blob = new Blob([idCardData], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ryd-professional-id-cards-${format(new Date(), 'yyyy-MM-dd')}.txt`)
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
          {filteredEmployees.length} employee(s) • {selectedEmployees.length} selected
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
          <CardDescription>Filter employees by role, department, or search by name/email</CardDescription>
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
                Select Employees
              </CardTitle>
              <CardDescription>Choose which employees to include in the professional ID generation</CardDescription>
            </div>
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading employees...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={() => handleSelectEmployee(employee.id)}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback className="bg-[#0B874E] text-white">
                      {employee.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{employee.name}</span>
                      <Badge variant="secondary" className="text-xs">{employee.role.replace('_', ' ')}</Badge>
                      <Badge 
                        variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'} 
                        className={`text-xs ${employee.status === 'ACTIVE' ? 'bg-green-600' : ''}`}
                      >
                        {employee.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {employee.department || employee.employeeProfile?.department || 'General'} • {employee.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {employee.employeeProfile?.position || employee.role.replace('_', ' ')} • Joined {format(new Date(employee.employeeProfile?.joinDate || employee.createdAt), 'MMM yyyy')}
                    </div>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No employees found matching your criteria</p>
                </div>
              )}
            </div>
          )}
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
              Processing {selectedEmployees.length} employee(s)... {generationProgress}%
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
          <CardDescription>Choose your preferred format for the professional RYD ID cards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => generateIdCards('pdf')}
              disabled={selectedEmployees.length === 0 || isGenerating}
              className="h-auto p-6 flex flex-col gap-2 bg-[#0B874E] hover:bg-[#0B874E]/90 text-white"
            >
              <CreditCard className="h-8 w-8" />
              <span className="font-medium">Professional PDF</span>
              <span className="text-xs opacity-90">RYD-MMYY-*** format with logo</span>
            </Button>
            
            <Button
              onClick={() => generateIdCards('png')}
              disabled={selectedEmployees.length === 0 || isGenerating}
              className="h-auto p-6 flex flex-col gap-2"
              variant="outline"
            >
              <Building2 className="h-8 w-8" />
              <span className="font-medium">Text Format</span>
              <span className="text-xs text-muted-foreground">ASCII ID cards with contact info</span>
            </Button>
            
            <Button
              onClick={() => generateIdCards('csv')}
              disabled={selectedEmployees.length === 0 || isGenerating}
              className="h-auto p-6 flex flex-col gap-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-medium">CSV Export</span>
              <span className="text-xs text-muted-foreground">Employee data with RYD IDs</span>
            </Button>
          </div>
          
          {selectedEmployees.length === 0 && !loading && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">Please select at least one employee to enable ID generation</span>
            </div>
          )}
          
          {selectedEmployees.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Ready to Generate Professional IDs</span>
              </div>
              <div className="text-xs text-green-700">
                <div className="flex items-center gap-4 flex-wrap">
                  <span>📋 Format: RYD-MMYY-XXX</span>
                  <span>📅 6-month validity</span>
                  <span>🏥 Official RYD logo</span>
                  <span>📞 Contact information</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}