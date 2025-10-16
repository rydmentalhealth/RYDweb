'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, Plus, X, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, DollarSign, AlertTriangle, Download, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { usePermissions } from '@/lib/hooks/usePermissions'

const expenseSchema = z.object({
  purpose: z.string().min(1, 'Purpose is required'),
  category: z.enum(['TRANSPORT', 'PRINTING', 'OUTREACH_EVENT', 'OFFICE_SUPPLIES', 'COMMUNICATION', 'TRAINING', 'MEETING_EXPENSES', 'EQUIPMENT', 'MAINTENANCE', 'OTHER']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  department: z.string().optional(),
  projectId: z.string().optional(),
})

interface ExpenseRequest {
  id: string
  purpose: string
  category: string
  amount: number
  description?: string
  status: string
  department?: string
  createdAt: string
  updatedAt: string
  
  // Requester info
  requester: {
    id: string
    name: string
    email: string
    department: string
  }
  
  // Approval workflow
  teamLead?: {
    id: string
    name: string
  }
  teamLeadApprovedAt?: string
  teamLeadNotes?: string
  
  financeApprovedBy?: {
    id: string
    name: string
  }
  financeApprovedAt?: string
  financeNotes?: string
  
  directorApprovedBy?: {
    id: string
    name: string
  }
  directorApprovedAt?: string
  directorNotes?: string
  
  // Payment details
  paidAt?: string
  paidBy?: string
  paymentMethod?: string
  voucherUrl?: string
  
  // Relations
  attachments: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize?: number
  }>
  
  comments: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
    }
  }>
  
  project?: {
    id: string
    name: string
  }
}

interface ExpenseStats {
  totalRequests: number
  pendingApprovals: number
  approvedAmount: number
  paidAmount: number
  rejectedCount: number
  averageProcessingTime: number
}

export function EnhancedExpenseSystem() {
  const permissions = usePermissions()
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([])
  const [stats, setStats] = useState<ExpenseStats>({
    totalRequests: 0,
    pendingApprovals: 0,
    approvedAmount: 0,
    paidAmount: 0,
    rejectedCount: 0,
    averageProcessingTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [activeTab, setActiveTab] = useState('my-requests')

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      purpose: '',
      category: 'OTHER',
      amount: 0,
      description: '',
      department: '',
      projectId: '',
    }
  })

  useEffect(() => {
    if (permissions.hasPermission('VIEW_EXPENSES')) {
      fetchExpenses()
      fetchStats()
    }
  }, [permissions, activeTab])

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams()
      
      // Filter based on active tab and user permissions
      if (activeTab === 'my-requests') {
        params.append('requester', permissions.user.id || '')
      } else if (activeTab === 'team-approvals' && permissions.hasPermission('APPROVE_EXPENSES_TL')) {
        params.append('teamLeadApproval', 'true')
      } else if (activeTab === 'finance-approvals' && permissions.hasPermission('APPROVE_EXPENSES_FINANCE')) {
        params.append('financeApproval', 'true')
      } else if (activeTab === 'director-approvals' && permissions.hasPermission('APPROVE_EXPENSES_DIRECTOR')) {
        params.append('directorApproval', 'true')
      } else if (activeTab === 'all-requests' && permissions.hasPermission('EDIT_ALL_EXPENSES')) {
        // No filter - show all
      }
      
      const response = await fetch(`/api/expenses?${params}`)
      if (!response.ok) throw new Error('Failed to fetch expenses')
      
      const data = await response.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
      toast.error('Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/expenses/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit expense request')
      }

      const result = await response.json()
      
      // Handle file uploads if any
      if (attachments.length > 0) {
        await uploadAttachments(result.id, attachments)
      }

      toast.success('Expense request submitted successfully')
      form.reset()
      setAttachments([])
      setIsSubmissionOpen(false)
      fetchExpenses()
      fetchStats()
    } catch (error) {
      console.error('Error submitting expense:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit expense request')
    }
  }

  const uploadAttachments = async (expenseId: string, files: File[]) => {
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      
      const response = await fetch(`/api/expenses/${expenseId}/attachments`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Failed to upload attachments')
    } catch (error) {
      console.error('Error uploading attachments:', error)
      toast.error('Failed to upload attachments')
    }
  }

  const handleApproval = async (expenseId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, notes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process approval')
      }

      toast.success(`Expense ${action}d successfully`)
      fetchExpenses()
      fetchStats()
    } catch (error) {
      console.error('Error processing approval:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process approval')
    }
  }

  const generateVoucher = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/voucher`, {
        method: 'POST',
      })
      
      if (!response.ok) throw new Error('Failed to generate voucher')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `voucher-${expenseId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Voucher generated successfully')
    } catch (error) {
      console.error('Error generating voucher:', error)
      toast.error('Failed to generate voucher')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED_BY_TL: 'bg-blue-100 text-blue-800',
      APPROVED_BY_FINANCE: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  const getApprovalProgress = (expense: ExpenseRequest) => {
    let progress = 0
    let currentStep = 'Submitted'
    
    if (expense.status === 'REJECTED' || expense.status === 'CANCELLED') {
      return { progress: 100, currentStep: expense.status, color: 'bg-red-500' }
    }
    
    if (expense.teamLeadApprovedAt) {
      progress = 33
      currentStep = 'Team Lead Approved'
    }
    
    if (expense.financeApprovedAt) {
      progress = 66
      currentStep = 'Finance Approved'
    }
    
    if (expense.paidAt) {
      progress = 100
      currentStep = 'Paid'
      return { progress, currentStep, color: 'bg-green-500' }
    }
    
    return { progress, currentStep, color: 'bg-blue-500' }
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

  // Check permissions for UI elements
  const canCreateExpenses = permissions.hasPermission('CREATE_EXPENSES')
  const canApproveAsTeamLead = permissions.hasPermission('APPROVE_EXPENSES_TL')
  const canApproveAsFinance = permissions.hasPermission('APPROVE_EXPENSES_FINANCE')
  const canApproveAsDirector = permissions.hasPermission('APPROVE_EXPENSES_DIRECTOR')
  const canViewAllExpenses = permissions.hasPermission('EDIT_ALL_EXPENSES')

  if (!permissions.hasPermission('VIEW_EXPENSES')) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have permission to view expenses. Contact your administrator for access.
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
          <h1 className="text-3xl font-bold tracking-tight">Expense Management System</h1>
          <p className="text-muted-foreground">
            Submit, track, and approve expense requests with automated workflow
          </p>
        </div>
        {canCreateExpenses && (
          <Dialog open={isSubmissionOpen} onOpenChange={setIsSubmissionOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Submit Expense Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Submit Expense Request</DialogTitle>
                <DialogDescription>
                  Submit a new expense request for approval. All requests will be reviewed by your team lead and finance team.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purpose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purpose *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Client meeting transportation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries({
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
                              }).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
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
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Outreach">Outreach</SelectItem>
                              <SelectItem value="Therapy">Therapy</SelectItem>
                              <SelectItem value="IT">IT</SelectItem>
                              <SelectItem value="Media">Media</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide additional details about this expense..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include any relevant details that will help with approval
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload Section */}
                  <div className="space-y-4">
                    <Label>Attachments (Receipts, Invoices, etc.)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload files
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, PDF up to 10MB each
                          </span>
                        </Label>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    {/* Display uploaded files */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <Label>Uploaded Files:</Label>
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSubmissionOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Request
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
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
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.approvedAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
          {canApproveAsTeamLead && (
            <TabsTrigger value="team-approvals">Team Approvals</TabsTrigger>
          )}
          {canApproveAsFinance && (
            <TabsTrigger value="finance-approvals">Finance Approvals</TabsTrigger>
          )}
          {canApproveAsDirector && (
            <TabsTrigger value="director-approvals">Director Approvals</TabsTrigger>
          )}
          {canViewAllExpenses && (
            <TabsTrigger value="all-requests">All Requests</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'my-requests' && 'My Expense Requests'}
                {activeTab === 'team-approvals' && 'Team Lead Approvals'}
                {activeTab === 'finance-approvals' && 'Finance Approvals'}
                {activeTab === 'director-approvals' && 'Director Approvals'}
                {activeTab === 'all-requests' && 'All Expense Requests'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'my-requests' && 'Track your submitted expense requests and their approval status'}
                {activeTab === 'team-approvals' && 'Review and approve expense requests from your team members'}
                {activeTab === 'finance-approvals' && 'Review and approve expenses from a financial perspective'}
                {activeTab === 'director-approvals' && 'Final approval for high-value or strategic expenses'}
                {activeTab === 'all-requests' && 'Comprehensive view of all expense requests in the system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
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
                    ) : expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No expense requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((expense) => {
                        const progress = getApprovalProgress(expense)
                        return (
                          <TableRow key={expense.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{expense.purpose}</div>
                                <div className="text-sm text-muted-foreground">
                                  {getCategoryLabel(expense.category)} • {format(new Date(expense.createdAt), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{expense.requester.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {expense.requester.department}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              UGX {expense.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>{getStatusBadge(expense.status)}</TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{progress.currentStep}</span>
                                  <span>{progress.progress}%</span>
                                </div>
                                <Progress value={progress.progress} className="h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedExpense(expense)
                                    setIsDetailsOpen(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {/* Team Lead Approval Actions */}
                                {canApproveAsTeamLead && expense.status === 'PENDING' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleApproval(expense.id, 'approve')}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleApproval(expense.id, 'reject')}
                                    >
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                                
                                {/* Finance Approval Actions */}
                                {canApproveAsFinance && expense.status === 'APPROVED_BY_TL' && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleApproval(expense.id, 'approve')}
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleApproval(expense.id, 'reject')}
                                    >
                                      <XCircle className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </>
                                )}
                                
                                {/* Generate Voucher */}
                                {expense.status === 'APPROVED_BY_FINANCE' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => generateVoucher(expense.id)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expense Request Details</DialogTitle>
            <DialogDescription>
              Complete information about the expense request and approval workflow
            </DialogDescription>
          </DialogHeader>
          
          {selectedExpense && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm text-muted-foreground">{selectedExpense.purpose}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-muted-foreground">{getCategoryLabel(selectedExpense.category)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm text-muted-foreground">UGX {selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
                </div>
              </div>
              
              {selectedExpense.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedExpense.description}</p>
                </div>
              )}
              
              {/* Approval Timeline */}
              <div>
                <Label className="text-sm font-medium">Approval Timeline</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Submitted by {selectedExpense.requester.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(selectedExpense.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  {selectedExpense.teamLeadApprovedAt && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Approved by Team Lead</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(selectedExpense.teamLeadApprovedAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                  
                  {selectedExpense.financeApprovedAt && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Approved by Finance</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(selectedExpense.financeApprovedAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                  
                  {selectedExpense.paidAt && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Payment Completed</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(selectedExpense.paidAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Attachments */}
              {selectedExpense.attachments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedExpense.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.fileName}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Comments */}
              {selectedExpense.comments.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Comments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedExpense.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}