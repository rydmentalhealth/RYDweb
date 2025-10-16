'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, DollarSign, Users, Clock, CheckCircle, Upload, FileSpreadsheet, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { usePermissions } from '@/lib/hooks/usePermissions'

const stipendSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['MONTHLY_STIPEND', 'ALLOWANCE', 'REIMBURSEMENT', 'BONUS', 'VOLUNTEER_ALLOWANCE', 'TRANSPORT_ALLOWANCE', 'MEAL_ALLOWANCE']),
  paymentMethod: z.enum(['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'CHEQUE']).optional(),
  remarks: z.string().optional(),
  department: z.string().optional(),
  paymentDate: z.string().optional(),
})

interface Stipend {
  id: string
  amount: number
  type: string
  status: string
  paymentDate?: string
  paymentMethod?: string
  remarks?: string
  department?: string
  createdAt: string
  employee: {
    id: string
    name: string
    email: string
    department: string
    jobTitle: string
  }
  approvedBy?: {
    id: string
    name: string
  }
}

interface StipendStats {
  totalMonthly: number
  pendingApprovals: number
  totalPaid: number
  totalRemaining: number
  departmentBreakdown: Array<{
    department: string
    total: number
    count: number
  }>
}

interface Employee {
  id: string
  name: string
  email: string
  department: string
  jobTitle: string
}

export function EnhancedStipendsDashboard() {
  const permissions = usePermissions()
  const [stipends, setStipends] = useState<Stipend[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<StipendStats>({
    totalMonthly: 0,
    pendingApprovals: 0,
    totalPaid: 0,
    totalRemaining: 0,
    departmentBreakdown: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [selectedStipend, setSelectedStipend] = useState<Stipend | null>(null)

  const form = useForm<z.infer<typeof stipendSchema>>({
    resolver: zodResolver(stipendSchema),
    defaultValues: {
      employeeId: '',
      amount: 0,
      type: 'MONTHLY_STIPEND',
      paymentMethod: undefined,
      remarks: '',
      department: '',
      paymentDate: '',
    }
  })

  useEffect(() => {
    if (permissions.hasPermission('VIEW_STIPENDS')) {
      fetchStipends()
      fetchEmployees()
      fetchStats()
    }
  }, [permissions])

  const fetchStipends = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      
      const response = await fetch(`/api/stipends?${params}`)
      if (!response.ok) throw new Error('Failed to fetch stipends')
      
      const data = await response.json()
      setStipends(data.stipends || [])
    } catch (error) {
      console.error('Error fetching stipends:', error)
      toast.error('Failed to fetch stipends')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (!response.ok) throw new Error('Failed to fetch employees')
      
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stipends/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const onSubmit = async (data: z.infer<typeof stipendSchema>) => {
    try {
      const response = await fetch('/api/stipends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create stipend')
      }

      toast.success('Stipend created successfully')
      form.reset()
      setIsAddDialogOpen(false)
      fetchStipends()
      fetchStats()
    } catch (error) {
      console.error('Error creating stipend:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create stipend')
    }
  }

  const handleApproveStipend = async (stipendId: string) => {
    if (!permissions.hasPermission('APPROVE_STIPENDS')) {
      toast.error('Insufficient permissions to approve stipends')
      return
    }

    try {
      const response = await fetch(`/api/stipends/${stipendId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve stipend')
      }

      toast.success('Stipend approved successfully')
      fetchStipends()
      fetchStats()
    } catch (error) {
      console.error('Error approving stipend:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to approve stipend')
    }
  }

  const handlePayStipend = async (stipendId: string) => {
    if (!permissions.hasPermission('APPROVE_STIPENDS')) {
      toast.error('Insufficient permissions to mark stipend as paid')
      return
    }

    try {
      const response = await fetch(`/api/stipends/${stipendId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'PAID' }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark stipend as paid')
      }

      toast.success('Stipend marked as paid successfully')
      fetchStipends()
      fetchStats()
    } catch (error) {
      console.error('Error marking stipend as paid:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to mark stipend as paid')
    }
  }

  const exportStipends = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      params.append('export', 'true')
      
      const response = await fetch(`/api/stipends?${params}`)
      if (!response.ok) throw new Error('Failed to export stipends')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stipends-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Stipends exported successfully')
    } catch (error) {
      console.error('Error exporting stipends:', error)
      toast.error('Failed to export stipends')
    }
  }

  const filteredStipends = stipends.filter(stipend => {
    const matchesSearch = stipend.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stipend.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      MONTHLY_STIPEND: 'Monthly Stipend',
      ALLOWANCE: 'Allowance',
      REIMBURSEMENT: 'Reimbursement',
      BONUS: 'Bonus',
      VOLUNTEER_ALLOWANCE: 'Volunteer Allowance',
      TRANSPORT_ALLOWANCE: 'Transport Allowance',
      MEAL_ALLOWANCE: 'Meal Allowance'
    }
    return labels[type as keyof typeof labels] || type
  }

  // Check permissions for UI elements
  const canCreateStipends = permissions.hasPermission('CREATE_STIPENDS')
  const canEditStipends = permissions.hasPermission('EDIT_STIPENDS')
  const canApproveStipends = permissions.hasPermission('APPROVE_STIPENDS')
  const canDeleteStipends = permissions.hasPermission('DELETE_STIPENDS')

  if (!permissions.hasPermission('VIEW_STIPENDS')) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have permission to view stipends. Contact your administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stipends & Allowances Management</h1>
          <p className="text-muted-foreground">
            Comprehensive tracking of employee stipends, volunteer allowances, and payments
          </p>
        </div>
        <div className="flex space-x-2">
          {canCreateStipends && (
            <>
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stipend
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Stipend</DialogTitle>
                    <DialogDescription>
                      Create a new stipend or allowance for an employee
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employeeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id}>
                                      {employee.name} - {employee.department}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MONTHLY_STIPEND">Monthly Stipend</SelectItem>
                                  <SelectItem value="ALLOWANCE">Allowance</SelectItem>
                                  <SelectItem value="REIMBURSEMENT">Reimbursement</SelectItem>
                                  <SelectItem value="BONUS">Bonus</SelectItem>
                                  <SelectItem value="VOLUNTEER_ALLOWANCE">Volunteer Allowance</SelectItem>
                                  <SelectItem value="TRANSPORT_ALLOWANCE">Transport Allowance</SelectItem>
                                  <SelectItem value="MEAL_ALLOWANCE">Meal Allowance</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (UGX) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="0" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                  <SelectItem value="CASH">Cash</SelectItem>
                                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks/Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional notes or remarks..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Create Stipend
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalMonthly.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Outreach">Outreach</SelectItem>
                <SelectItem value="Therapy">Therapy</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchStipends}>
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
            <Button variant="outline" onClick={exportStipends}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Stipends</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stipends.filter(s => s.status === 'PENDING').length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stipends.filter(s => s.status === 'APPROVED').length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({stipends.filter(s => s.status === 'PAID').length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredStipends.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No stipends found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStipends.map((stipend) => (
                        <TableRow key={stipend.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{stipend.employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {stipend.employee.email}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {stipend.employee.department} • {stipend.employee.jobTitle}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeLabel(stipend.type)}</TableCell>
                          <TableCell className="font-medium">
                            UGX {stipend.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(stipend.status)}</TableCell>
                          <TableCell>
                            {stipend.paymentDate 
                              ? format(new Date(stipend.paymentDate), 'MMM dd, yyyy')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canEditStipends && (
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {canApproveStipends && stipend.status === 'PENDING' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApproveStipend(stipend.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {canApproveStipends && stipend.status === 'APPROVED' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePayStipend(stipend.id)}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              )}
                              {canDeleteStipends && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Similar content for other tabs with filtered data */}
            <TabsContent value="pending" className="mt-6">
              {/* Filtered table for pending stipends */}
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              {/* Filtered table for approved stipends */}
            </TabsContent>

            <TabsContent value="paid" className="mt-6">
              {/* Filtered table for paid stipends */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Stipends</DialogTitle>
            <DialogDescription>
              Upload multiple stipends using a CSV file. Download the template first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="bulk-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload CSV file
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    CSV files up to 10MB
                  </span>
                </Label>
                <input
                  id="bulk-upload"
                  type="file"
                  accept=".csv"
                  className="sr-only"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                Cancel
              </Button>
              <Button>
                Upload & Process
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}