"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

// Define form validation schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  projectId: z.string().optional(),
  accessLevel: z.string().min(1, { message: "Please select an access level" }),
  isPublic: z.boolean(),
  tags: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Category {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

export function AddDocumentSheet() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([
    { id: "cat1", name: "Training Materials" },
    { id: "cat2", name: "Policies & Procedures" },
    { id: "cat3", name: "Presentations" },
    { id: "cat4", name: "Reports" },
    { id: "cat5", name: "Forms" },
  ])
  const [projects, setProjects] = useState<Project[]>([
    { id: "proj1", name: "Mental Health Awareness Campaign" },
    { id: "proj2", name: "Community Outreach Initiative" },
    { id: "proj3", name: "Youth Development Program" },
  ])

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      projectId: "",
      accessLevel: "ALL_STAFF",
      isPublic: false,
      tags: "",
    },
  })

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      
      // Auto-fill title with filename (without extension)
      const fileName = e.target.files[0].name
      const titleWithoutExt = fileName.substring(0, fileName.lastIndexOf("."))
      form.setValue("title", titleWithoutExt.replace(/_/g, " ").replace(/-/g, " "))
    }
  }

  // Remove selected file
  const removeFile = () => {
    setFile(null)
  }

  // Submit handler
  const onSubmit = async (data: FormValues) => {
    if (!file) {
      toast.error("Please select a file to upload")
      return
    }

    try {
      setIsUploading(true)
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 200)
      
      // Simulate API call with a delay
      setTimeout(async () => {
        clearInterval(interval)
        
        // Create form data
        const formData = new FormData()
        formData.append("file", file)
        formData.append("data", JSON.stringify(data))
        
        // In a real implementation, you would send this to your API
        // const response = await fetch("/api/resources/documents", {
        //   method: "POST",
        //   body: formData,
        // })
        
        // if (!response.ok) {
        //   throw new Error("Failed to upload document")
        // }
        
        setUploadProgress(100)
        
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(null)
          setFile(null)
          form.reset()
          setOpen(false)
          toast.success("Document uploaded successfully")
          router.refresh()
        }, 500)
      }, 2000)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload document")
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </SheetTrigger>
      <SheetContent size="content" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Upload New Document</SheetTitle>
          <SheetDescription>
            Upload documents, presentations, or other files to share with your team.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <FormLabel>Document File</FormLabel>
                <div className="mt-2">
                  {!file ? (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/30 border-muted-foreground/25"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, DOC, PPT, XLS, Images (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center p-2 mt-2 space-x-2 border rounded-md bg-muted/20">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {uploadProgress !== null ? (
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={removeFile}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Document Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a brief description of this document"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project (Optional) */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Associate with a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional: Associate this document with a specific project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Access Level */}
              <FormField
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select access level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALL_STAFF">All Staff</SelectItem>
                        <SelectItem value="MANAGEMENT">Management Only</SelectItem>
                        <SelectItem value="ALL_VOLUNTEERS">All Volunteers</SelectItem>
                        <SelectItem value="ADMIN_ONLY">Admin Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Public/Private Toggle */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Document</FormLabel>
                      <FormDescription>
                        Make this document available on the public website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isUploading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter comma-separated tags"
                        {...field}
                        disabled={isUploading}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Add tags to help with searching (e.g., "training, guide, 2024")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Display tags preview if entered */}
              {form.watch("tags") && (
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags")?.split(",")
                    .filter((tag) => tag.trim().length > 0)
                    .map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                </div>
              )}
              
              <SheetFooter>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Document"
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
} 