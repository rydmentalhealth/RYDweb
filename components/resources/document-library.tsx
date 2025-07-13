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
import {
  Loader2,
  MoreHorizontal,
  AlertCircle,
  Download,
  File,
  FileText,
  Image,
  FileArchive,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Document {
  id: string
  title: string
  description?: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  categoryId?: string
  category?: { name: string }
  uploadedById: string
  uploadedBy: { firstName: string; lastName: string }
  projectId?: string
  project?: { name: string }
  accessLevel: string
  isPublic: boolean
  tags?: string
  createdAt: string
  updatedAt: string
}

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/resources/documents')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`)
        }
        
        const data = await response.json()
        setDocuments(data)
      } catch (err) {
        console.error("Error fetching documents:", err)
        setError("Failed to load documents. Please try again.")
        toast.error("Failed to load documents")
        
        // For demo, set some dummy data
        setDocuments([
          {
            id: "1",
            title: "Mental Health Training Manual",
            description: "Comprehensive training guide for mental health champions",
            fileName: "mh_training_manual_v2.pdf",
            fileUrl: "https://example.com/files/manual.pdf",
            fileType: "application/pdf",
            fileSize: 2457600,
            categoryId: "cat1",
            category: { name: "Training Materials" },
            uploadedById: "user1",
            uploadedBy: { firstName: "John", lastName: "Doe" },
            projectId: "proj1",
            project: { name: "Mental Health Awareness Campaign" },
            accessLevel: "ALL_STAFF",
            isPublic: false,
            tags: "training,mental health,manual",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "2",
            title: "Volunteer Handbook 2024",
            description: "Official handbook for all RYD volunteers",
            fileName: "volunteer_handbook_2024.pdf",
            fileUrl: "https://example.com/files/handbook.pdf",
            fileType: "application/pdf",
            fileSize: 1843200,
            categoryId: "cat2",
            category: { name: "Policies & Procedures" },
            uploadedById: "user1",
            uploadedBy: { firstName: "John", lastName: "Doe" },
            projectId: undefined,
            project: undefined,
            accessLevel: "ALL_VOLUNTEERS",
            isPublic: false,
            tags: "handbook,policy,guidelines",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "3",
            title: "Community Outreach Presentation",
            description: "Presentation template for community events",
            fileName: "community_outreach.pptx",
            fileUrl: "https://example.com/files/presentation.pptx",
            fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            fileSize: 5242880,
            categoryId: "cat3",
            category: { name: "Presentations" },
            uploadedById: "user2",
            uploadedBy: { firstName: "Jane", lastName: "Smith" },
            projectId: "proj2",
            project: { name: "Community Outreach Initiative" },
            accessLevel: "ALL_STAFF",
            isPublic: true,
            tags: "presentation,outreach,community",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchDocuments()
  }, [])
  
  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <File className="h-5 w-5 text-red-500" />
    } else if (fileType.includes("image")) {
      return <Image className="h-5 w-5 text-blue-500" />
    } else if (fileType.includes("zip") || fileType.includes("rar") || fileType.includes("tar")) {
      return <FileArchive className="h-5 w-5 text-yellow-500" />
    } else if (fileType.includes("text") || fileType.includes("document")) {
      return <FileText className="h-5 w-5 text-green-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + " B"
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(1) + " KB"
    } else if (bytes < 1073741824) {
      return (bytes / 1048576).toFixed(1) + " MB"
    } else {
      return (bytes / 1073741824).toFixed(1) + " GB"
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
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No documents found. Upload a document to get started.
      </div>
    )
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Access Level</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFileIcon(document.fileType)}
                  <div>
                    <div className="font-medium">{document.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {document.fileName} ({formatFileSize(document.fileSize)})
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {document.category ? (
                  <Badge variant="outline">{document.category.name}</Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                {document.uploadedBy.firstName} {document.uploadedBy.lastName}
              </TableCell>
              <TableCell>{document.project?.name || "—"}</TableCell>
              <TableCell>
                <Badge
                  variant={document.isPublic ? "default" : "secondary"}
                  className="capitalize"
                >
                  {document.accessLevel.replace(/_/g, ' ').toLowerCase()}
                  {document.isPublic && " (Public)"}
                </Badge>
              </TableCell>
              <TableCell>{format(new Date(document.createdAt), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      window.open(document.fileUrl, "_blank")
                      toast.info("Opening document in new tab")
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Download functionality would be implemented here
                      toast.info("Download feature coming soon")
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
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
                          // Edit document (to be implemented)
                          toast.info("Edit document feature coming soon")
                        }}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                        onClick={() => {
                          // Delete document (to be implemented)
                          toast.info("Delete document feature coming soon")
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 