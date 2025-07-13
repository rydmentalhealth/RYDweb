"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Loader2, MoreHorizontal, AlertCircle, PencilIcon, Trash2Icon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"

interface Transaction {
  id: string
  type: "EXPENSE" | "INCOME" | "DONATION" | "GRANT"
  amount: number
  date: string
  description?: string
  category?: string
  projectId?: string
  project?: { name: string }
}

interface TransactionsClientProps {
  type?: string
}

export function TransactionsClient({ type }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Build the URL with query parameters
        let url = '/api/finance/transactions'
        const params = new URLSearchParams()
        
        if (type) {
          params.append('type', type)
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`
        }
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`)
        }
        
        const data = await response.json()
        setTransactions(data)
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transactions. Please try again.")
        toast.error("Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    
    fetchTransactions()
  }, [type])
  
  // Get badge color based on transaction type
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "EXPENSE":
        return "destructive"
      case "INCOME":
        return "success"
      case "DONATION":
        return "purple" // Custom color defined in tailwind.config
      case "GRANT":
        return "blue"   // Custom color defined in tailwind.config
      default:
        return "secondary"
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-40 text-destructive gap-2">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    )
  }
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found. Add a new transaction to get started.
      </div>
    )
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <Badge variant={getTypeBadgeColor(transaction.type) as any}>
                  {transaction.type.charAt(0) + transaction.type.slice(1).toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>{transaction.category || "—"}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {transaction.description || "—"}
              </TableCell>
              <TableCell>{transaction.project?.name || "—"}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Handle edit (to be implemented)
                        toast.info("Edit transaction feature coming soon")
                      }}
                    >
                      <PencilIcon className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                      onClick={() => {
                        // Handle delete (to be implemented)
                        toast.info("Delete transaction feature coming soon")
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 