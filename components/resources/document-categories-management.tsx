"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  FolderPlus, 
  Pencil, 
  Trash2, 
  Folder, 
  Loader2, 
  MoreHorizontal 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters" }),
  description: z.string().optional(),
  color: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Category {
  id: string
  name: string
  description?: string
  color?: string
  documentCount: number
  createdAt: string
}

export function DocumentCategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "cat1",
      name: "Training Materials",
      description: "All training guides, manuals, and resources",
      color: "#4f46e5",
      documentCount: 12,
      createdAt: "2024-01-15T12:00:00Z"
    },
    {
      id: "cat2",
      name: "Policies & Procedures",
      description: "Organization policies, procedures and guidelines",
      color: "#0891b2",
      documentCount: 8,
      createdAt: "2024-01-18T14:30:00Z"
    },
    {
      id: "cat3",
      name: "Presentations",
      description: "Slides and presentation materials",
      color: "#db2777",
      documentCount: 5,
      createdAt: "2024-02-05T09:15:00Z"
    },
    {
      id: "cat4",
      name: "Reports",
      description: "Annual reports, project reports and assessments",
      color: "#65a30d",
      documentCount: 3,
      createdAt: "2024-03-10T16:45:00Z"
    },
    {
      id: "cat5",
      name: "Forms",
      description: "Templates and forms for various purposes",
      color: "#ea580c",
      documentCount: 7,
      createdAt: "2024-04-02T11:20:00Z"
    }
  ])

  const [loading, setLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#4f46e5",
    },
  })

  // Open dialog for creating new category
  const openCreateDialog = () => {
    form.reset({
      name: "",
      description: "",
      color: "#4f46e5",
    })
    setEditingCategory(null)
    setDialogOpen(true)
  }

  // Open dialog for editing category
  const openEditDialog = (category: Category) => {
    form.reset({
      name: category.name,
      description: category.description || "",
      color: category.color || "#4f46e5",
    })
    setEditingCategory(category)
    setDialogOpen(true)
  }

  // Open dialog for deleting category
  const openDeleteDialog = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  // Submit handler for create/edit
  const onSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (editingCategory) {
        // Update existing category
        setCategories(prev => 
          prev.map(cat => 
            cat.id === editingCategory.id 
              ? { ...cat, ...data } 
              : cat
          )
        )
        toast.success(`Category "${data.name}" updated successfully`)
      } else {
        // Create new category
        const newCategory: Category = {
          id: `cat${categories.length + 1}`,
          name: data.name,
          description: data.description,
          color: data.color,
          documentCount: 0,
          createdAt: new Date().toISOString(),
        }
        setCategories(prev => [...prev, newCategory])
        toast.success(`Category "${data.name}" created successfully`)
      }
      
      setDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error saving category:", error)
      toast.error("Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!categoryToDelete) return
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id))
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Document Categories</CardTitle>
          <CardDescription>
            Manage the categories used to organize documents
          </CardDescription>
        </div>
        <Button onClick={openCreateDialog}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Documents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Folder
                      className="h-5 w-5"
                      style={{ color: category.color || "#4f46e5" }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {category.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{category.documentCount}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={() => openEditDialog(category)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                        onClick={() => openDeleteDialog(category)}
                        disabled={category.documentCount > 0}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of this document category"
                : "Add a new category to organize your documents"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief description of this category"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Provide context about what documents belong in this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input type="color" {...field} className="w-12 h-10 p-1" />
                      </FormControl>
                      <div className="flex items-center gap-2">
                        <Folder
                          className="h-5 w-5"
                          style={{ color: field.value || "#4f46e5" }}
                        />
                        <span>Preview</span>
                      </div>
                    </div>
                    <FormDescription>
                      Choose a color to help visually identify this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category?
              {categoryToDelete?.documentCount && categoryToDelete.documentCount > 0 && (
                <div className="mt-2 text-destructive">
                  This category contains {categoryToDelete.documentCount} documents.
                  Please reassign or delete these documents first.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || (categoryToDelete?.documentCount || 0) > 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 