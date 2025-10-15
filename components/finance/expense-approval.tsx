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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Download, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface ExpenseRequest {
  id: string
  purpose: string
  category: string
  amount: number
  description?: string
  status: string
  department?: string
  createdAt: string
  teamLeadApprovedAt?: string
  financeApprovedAt?: string
  directorApprovedAt?: string
  paidAt?: string
  teamLeadNotes?: string
  financeNotes?: string
  directorNotes?: string
  paymentMethod?: string
  voucherUrl?: string
  requester: {
    id: string
    name: string
    email: string
    department: string
    jobTitle: string
  }
  teamLead?: {
    id: string
    name: string
  }
  financeApprovedBy?: {
    id: string
    name: string
  }
  directorApprovedBy?: {
    id: string
    name: string
  }
  project?: {
    id: string
    name: string
  }
  attachments: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
  }>
  comments: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
      avatar?: string
    }
  }>
}

export function ExpenseApproval() {
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isApprovalOpen, setIsApprovalOpen] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (departmentFilter !== 'all') params.append('department', departmentFilter)
      
      const response = await fetch(`/api/expenses?${params}`)
      const data = await response.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (expenseId: string, action: 'approve' | 'reject') => {
    try {
      let newStatus = ''
      
      // Determine the next status based on current status
      const expense = expenses.find(e => e.id === expenseId)
      if (!expense) return

      if (action === 'approve') {
        if (expense.status === 'PENDING') {
          newStatus = 'APPROVED_BY_TL'
        } else if (expense.status === 'APPROVED_BY_TL') {
          newStatus = 'APPROVED_BY_FINANCE'
        } else if (expense.status === 'APPROVED_BY_FINANCE') {
          newStatus = 'PAID'
        }
      } else {
        newStatus = 'REJECTED'
      }

      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          teamLeadNotes: expense.status === 'PENDING' ? approvalNotes : undefined,
          financeNotes: expense.status === 'APPROVED_BY_TL' ? approvalNotes : undefined,
          directorNotes: expense.status === 'APPROVED_BY_FINANCE' ? approvalNotes : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update expense')
      }

      toast.success(`Expense ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
      setApprovalNotes('')
      setIsApprovalOpen(false)
      fetchExpenses()
    } catch (error) {
      console.error('Error updating expense:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update expense')
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.requester.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.requester.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED_BY_TL: 'bg-blue-100 text-blue-800',
      APPROVED_BY_FINANCE: 'bg-green-100 text-green-800',
      PAID: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      TRANSPORT: 'Transport',
      PRINTING: 'Printing',
      OUTREACH_EVENT: 'Outreach Event',
      OFFICE_SUPPLIES: 'Office Supplies',
      COMMUNICATION: 'Communication',
      TRAINING: 'Training',
      MEETING_EXPENSES: 'Meeting Expenses',
      EQUIPMENT: 'Equipment',
      MAINTENANCE: 'Maintenance',
      OTHER: 'Other'
    }
    return labels[category as keyof typeof labels] || category
  }

  const canApprove = (expense: ExpenseRequest) => {
    // This would check user permissions based on role and current status
    return ['PENDING', 'APPROVED_BY_TL', 'APPROVED_BY_FINANCE'].includes(expense.status)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Approval</h1>
          <p className="text-muted-foreground">
            Review and approve expense requests from team members
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by purpose, requester name, or email..."
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
                <SelectItem value="APPROVED_BY_TL">Approved by TL</SelectItem>
                <SelectItem value="APPROVED_BY_FINANCE">Approved by Finance</SelectItem>
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
            <Button variant="outline" onClick={fetchExpenses}>
              <Filter className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requester</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No expense requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{expense.requester.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {expense.requester.email}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {expense.requester.department} • {expense.requester.jobTitle}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {expense.purpose}
                          </TableCell>
                          <TableCell>{getCategoryLabel(expense.category)}</TableCell>
                          <TableCell className="font-medium">
                            UGX {expense.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(expense.status)}</TableCell>
                          <TableCell>
                            {format(new Date(expense.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedExpense(expense)
                                  setIsDetailOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {canApprove(expense) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedExpense(expense)
                                      setApprovalAction('approve')
                                      setIsApprovalOpen(true)
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedExpense(expense)
                                      setApprovalAction('reject')
                                      setIsApprovalOpen(true)
                                    }}
                                  >
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
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
          </Tabs>
        </CardContent>
      </Card>

      {/* Expense Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expense Request Details</DialogTitle>
            <DialogDescription>
              Review all details and attachments for this expense request
            </DialogDescription>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Requester</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.requester.name} ({selectedExpense.requester.email})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.requester.department} • {selectedExpense.requester.jobTitle}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-2xl font-bold">UGX {selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm">{selectedExpense.purpose}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{getCategoryLabel(selectedExpense.category)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted</Label>
                  <p className="text-sm">{format(new Date(selectedExpense.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>

              {/* Description */}
              {selectedExpense.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedExpense.description}</p>
                </div>
              )}

              {/* Attachments */}
              {selectedExpense.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedExpense.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{attachment.fileName}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval History */}
              <div>
                <Label className="text-sm font-medium">Approval History</Label>
                <div className="mt-2 space-y-2">
                  {selectedExpense.teamLeadApprovedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved by Team Lead: {selectedExpense.teamLead?.name}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(selectedExpense.teamLeadApprovedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedExpense.financeApprovedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved by Finance: {selectedExpense.financeApprovedBy?.name}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(selectedExpense.financeApprovedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedExpense.directorApprovedAt && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Approved by Director: {selectedExpense.directorApprovedBy?.name}</span>
                      <span className="text-muted-foreground">
                        {format(new Date(selectedExpense.directorApprovedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Expense Request
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? 'Add any notes for this approval'
                : 'Please provide a reason for rejection'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-notes">Notes</Label>
              <Textarea
                id="approval-notes"
                placeholder={approvalAction === 'approve' 
                  ? 'Add approval notes (optional)...'
                  : 'Please provide a reason for rejection...'
                }
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsApprovalOpen(false)
                  setApprovalNotes('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                onClick={() => {
                  if (selectedExpense) {
                    handleApproval(selectedExpense.id, approvalAction)
                  }
                }}
              >
                {approvalAction === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
