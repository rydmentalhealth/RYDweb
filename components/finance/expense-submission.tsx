'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const expenseSchema = z.object({
  purpose: z.string().min(1, 'Purpose is required'),
  category: z.enum(['TRANSPORT', 'PRINTING', 'OUTREACH_EVENT', 'OFFICE_SUPPLIES', 'COMMUNICATION', 'TRAINING', 'MEETING_EXPENSES', 'EQUIPMENT', 'MAINTENANCE', 'OTHER']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  department: z.string().optional(),
  projectId: z.string().optional(),
})

interface ExpenseSubmissionProps {
  onSuccess?: () => void
}

export function ExpenseSubmission({ onSuccess }: ExpenseSubmissionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

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

  const onSubmit = async (data: z.infer<typeof expenseSchema>) => {
    try {
      setIsSubmitting(true)
      
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
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting expense:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit expense request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadAttachments = async (expenseId: string, files: File[]) => {
    // This would implement file upload to Cloudinary or AWS S3
    // For now, we'll just log the files
    console.log('Uploading attachments for expense:', expenseId, files)
    // TODO: Implement actual file upload
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
