'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { AddEmployeeDialog } from './add-employee-dialog'
import { EditEmployeeDialog } from './edit-employee-dialog'

interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED'
  hireDate: string
  phone?: string
  location?: string
  manager?: string
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }
      const data = await response.json()
      
      // Transform the API response to match our interface
      const transformedEmployees: Employee[] = data.employees.map((emp: any) => ({
        id: emp.id,
        name: emp.fullName,
        email: emp.email || emp.user?.email || '',
        role: emp.designation || 'N/A',
        department: emp.department || 'N/A',
        status: emp.status,
        hireDate: emp.startDate || emp.createdAt,
        phone: emp.phone,
        location: 'Kampala', // Default location
        manager: emp.supervisor?.fullName
      }))
      
      setEmployees(transformedEmployees)
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Fallback to empty array on error
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      INACTIVE: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      PENDING: { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' },
      SUSPENDED: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    )
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment
    
    return matchesSearch && matchesDepartment
  })

  const departments = ['all', ...Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)))]

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEditDialogOpen(true)
  }

  const handleViewEmployee = (employee: Employee) => {
    // Navigate to employee detail page or show view modal
    window.location.href = `/employees/${employee.id}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading employees...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">Manage employee profiles and organizational structure</p>
        </div>
        <AddEmployeeDialog onEmployeeAdded={fetchEmployees} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Directory</CardTitle>
          <CardDescription>
            Search and filter through your organization's employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {employee.email}
                          </div>
                          {employee.phone && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {employee.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{employee.role}</div>
                      {employee.location && (
                        <div className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {employee.location}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      {new Date(employee.hireDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{employee.manager || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewEmployee(employee)}
                          title="View Employee"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          title="Edit Employee"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          title="More Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>No employees found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        employee={editingEmployee}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEmployeeUpdated={fetchEmployees}
      />
    </div>
  )
}