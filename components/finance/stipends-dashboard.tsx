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
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, DollarSign, Users, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

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
}

export function StipendsDashboard() {
  const [stipends, setStipends] = useState<Stipend[]>([])
  const [stats, setStats] = useState<StipendStats>({
    totalMonthly: 0,
    pendingApprovals: 0,
    totalPaid: 0,
    totalRemaining: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchStipends()
    fetchStats()
  }, [])

  const fetchStipends = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      
      const response = await fetch(`/api/stipends?${params}`)
      const data = await response.json()
      setStipends(data.stipends || [])
    } catch (error) {
      console.error('Error fetching stipends:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // This would be a separate API endpoint for stats
      // For now, we'll calculate from the stipends data
      const response = await fetch('/api/stipends')
      const data = await response.json()
      
      const stipends = data.stipends || []
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
      
      const monthlyStipends = stipends.filter((s: Stipend) => 
        s.createdAt.startsWith(currentMonth)
      )
      
      setStats({
        totalMonthly: monthlyStipends.reduce((sum: number, s: Stipend) => sum + s.amount, 0),
        pendingApprovals: stipends.filter((s: Stipend) => s.status === 'PENDING').length,
        totalPaid: stipends.filter((s: Stipend) => s.status === 'PAID').reduce((sum: number, s: Stipend) => sum + s.amount, 0),
        totalRemaining: 0 // This would come from budget data
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stipends Management</h1>
          <p className="text-muted-foreground">
            Manage employee stipends, allowances, and volunteer payments
          </p>
        </div>
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
            {/* Add Stipend Form would go here */}
            <div className="p-4 text-center text-muted-foreground">
              Add Stipend Form Component
            </div>
          </DialogContent>
        </Dialog>
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Stipends</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
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
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
