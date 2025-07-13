"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface AddTransactionSheetProps {
  trigger: React.ReactNode
}

export function AddTransactionSheet({ trigger }: AddTransactionSheetProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [type, setType] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [description, setDescription] = useState<string>("")
  const [project, setProject] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [projects, setProjects] = useState<{id: string, name: string}[]>([])
  
  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
        }
      } catch (error) {
        console.error("Error fetching projects:", error)
        // Fallback to mock data if API fails
        setProjects([
          { id: "project1", name: "Mental Health Awareness Campaign" },
          { id: "project2", name: "Youth Counseling Program" },
          { id: "project3", name: "Community Outreach Initiative" },
        ])
      }
    }
    
    fetchProjects()
  }, [])
  
  // Categories based on transaction type
  const getCategories = () => {
    switch (type) {
      case "EXPENSE":
        return [
          { id: "supplies", name: "Office Supplies" },
          { id: "travel", name: "Travel & Transportation" },
          { id: "utilities", name: "Utilities" },
          { id: "salary", name: "Salaries & Wages" },
          { id: "rent", name: "Rent & Facilities" },
          { id: "other", name: "Other Expenses" },
        ]
      case "INCOME":
        return [
          { id: "service", name: "Service Fees" },
          { id: "interest", name: "Interest Income" },
          { id: "other", name: "Other Income" },
        ]
      case "DONATION":
        return [
          { id: "individual", name: "Individual Donation" },
          { id: "corporate", name: "Corporate Donation" },
          { id: "event", name: "Fundraising Event" },
          { id: "online", name: "Online Campaign" },
        ]
      case "GRANT":
        return [
          { id: "government", name: "Government Grant" },
          { id: "foundation", name: "Foundation Grant" },
          { id: "corporate", name: "Corporate Grant" },
          { id: "international", name: "International Aid" },
        ]
      default:
        return []
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!type || !amount || !date) {
      toast.error("Please fill in all required fields")
      return
    }
    
    try {
      setLoading(true)
      
      // Prepare data for submission
      const transactionData = {
        type,
        amount: parseFloat(amount),
        date: date.toISOString(),
        description: description || undefined,
        category: category || undefined,
        projectId: project === "none" ? null : project || null,
      }
      
      // Send data to API
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }
      
      toast.success("Transaction added successfully")
      
      // Reset form and close sheet
      setType("")
      setAmount("")
      setDate(new Date())
      setDescription("")
      setProject("")
      setCategory("")
      setOpen(false)
    } catch (error) {
      console.error("Error creating transaction:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add transaction")
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" size="content" className="overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Add New Transaction</SheetTitle>
            <SheetDescription>
              Add a new financial transaction to the system.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={type}
                onValueChange={setType}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="DONATION">Donation</SelectItem>
                  <SelectItem value="GRANT">Grant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {type && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories().map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project">Related Project (Optional)</Label>
              <Select
                value={project}
                onValueChange={setProject}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter transaction details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              disabled={loading || !type || !amount}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Transaction"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 