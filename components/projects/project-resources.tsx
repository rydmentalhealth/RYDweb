"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Plus,
  FileText,
  Image,
  File,
  Download,
  ExternalLink,
  FolderOpen,
  BookOpen,
  Upload,
  Trash2,
  Eye
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProjectResourcesProps {
  project: {
    id: string
    name: string
    googleDriveFolderId?: string
    notionPageId?: string
    resources?: Array<{
      id: string
      fileName: string
      fileUrl: string
      fileType: string
      fileSize?: number
      uploadedAt: string
      uploadedBy: {
        firstName: string
        lastName: string
        avatar?: string
      }
    }>
  }
}

export function ProjectResources({ project }: ProjectResourcesProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-green-100 text-green-800'
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800'
    if (fileType.includes('word') || fileType.includes('document')) return 'bg-blue-100 text-blue-800'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'bg-green-100 text-green-800'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      // TODO: Implement file upload API
      console.log('Uploading file:', file.name)
      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload file")
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return
    
    try {
      // TODO: Implement API call to delete resource
      console.log('Deleting resource:', resourceId)
      toast.success("Resource deleted successfully")
    } catch (error) {
      toast.error("Failed to delete resource")
      console.error("Error deleting resource:", error)
    }
  }

  const filteredResources = project.resources?.filter(resource =>
    resource.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Resources</h3>
          <p className="text-sm text-muted-foreground">
            Files, documents, and resources for this project
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a file to this project's resources
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                    disabled={isUploading}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {}}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Integration Links */}
      {(project.googleDriveFolderId || project.notionPageId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">External Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {project.googleDriveFolderId && (
                <Button variant="outline" asChild>
                  <a 
                    href={`https://drive.google.com/drive/folders/${project.googleDriveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Google Drive
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
              {project.notionPageId && (
                <Button variant="outline" asChild>
                  <a 
                    href={`https://notion.so/${project.notionPageId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View in Notion
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="outline">
          {filteredResources.length} file{filteredResources.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <Card key={resource.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(resource.fileType)}
                    <div>
                      <h4 className="font-medium">{resource.fileName}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className={getFileTypeColor(resource.fileType)}>
                          {resource.fileType}
                        </Badge>
                        <span>{formatFileSize(resource.fileSize)}</span>
                        <span>•</span>
                        <span>{format(parseISO(resource.uploadedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={resource.uploadedBy.avatar} alt={`${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName}`} />
                        <AvatarFallback className="text-xs">
                          {resource.uploadedBy.firstName?.[0]}{resource.uploadedBy.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{resource.uploadedBy.firstName} {resource.uploadedBy.lastName}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(resource.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No resources uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload files to share with your team</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resource Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resource Categories</CardTitle>
          <CardDescription>
            Organize your project resources by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Documents</p>
              <p className="text-xs text-muted-foreground">
                {filteredResources.filter(r => r.fileType.includes('pdf') || r.fileType.includes('document')).length} files
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Image className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Images</p>
              <p className="text-xs text-muted-foreground">
                {filteredResources.filter(r => r.fileType.startsWith('image/')).length} files
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <File className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Other</p>
              <p className="text-xs text-muted-foreground">
                {filteredResources.filter(r => !r.fileType.includes('pdf') && !r.fileType.includes('document') && !r.fileType.startsWith('image/')).length} files
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">External</p>
              <p className="text-xs text-muted-foreground">
                {(project.googleDriveFolderId ? 1 : 0) + (project.notionPageId ? 1 : 0)} links
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}