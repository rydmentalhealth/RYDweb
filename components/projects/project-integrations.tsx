"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  FolderOpen, 
  BookOpen, 
  ExternalLink, 
  Plus, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Link,
  Unlink
} from "lucide-react"
import { toast } from "sonner"
import { useProjectPermissions } from "@/lib/hooks/use-project-permissions"

interface ProjectIntegrationsProps {
  project: {
    id: string
    name: string
    description?: string
    googleDriveFolderId?: string
    notionPageId?: string
  }
  onUpdate?: () => void
}

export function ProjectIntegrations({ project, onUpdate }: ProjectIntegrationsProps) {
  const permissions = useProjectPermissions()
  const [isConnecting, setIsConnecting] = useState<'google-drive' | 'notion' | null>(null)
  const [showGoogleDriveDialog, setShowGoogleDriveDialog] = useState(false)
  const [showNotionDialog, setShowNotionDialog] = useState(false)
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState(project.googleDriveFolderId || '')
  const [notionPageId, setNotionPageId] = useState(project.notionPageId || '')

  const handleGoogleDriveConnect = async () => {
    try {
      setIsConnecting('google-drive')
      
      // Get Google Drive auth URL
      const response = await fetch(`/api/integrations/google-drive?projectId=${project.id}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message)
      }
      
      // Open OAuth popup
      const popup = window.open(
        data.authUrl,
        'google-drive-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsConnecting(null)
          // Check if connection was successful
          // This would typically be handled by a callback URL
          toast.info("Please complete the Google Drive authorization")
        }
      }, 1000)
      
    } catch (error) {
      console.error("Error connecting to Google Drive:", error)
      toast.error("Failed to connect to Google Drive")
      setIsConnecting(null)
    }
  }

  const handleNotionConnect = async () => {
    try {
      setIsConnecting('notion')
      
      // Get Notion auth URL
      const response = await fetch(`/api/integrations/notion?projectId=${project.id}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message)
      }
      
      // Open OAuth popup
      const popup = window.open(
        data.authUrl,
        'notion-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )
      
      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setIsConnecting(null)
          toast.info("Please complete the Notion authorization")
        }
      }, 1000)
      
    } catch (error) {
      console.error("Error connecting to Notion:", error)
      toast.error("Failed to connect to Notion")
      setIsConnecting(null)
    }
  }

  const handleManualGoogleDriveLink = async () => {
    try {
      if (!googleDriveFolderId.trim()) {
        toast.error("Please enter a valid Google Drive folder ID")
        return
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleDriveFolderId: googleDriveFolderId.trim()
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      toast.success("Google Drive folder linked successfully")
      setShowGoogleDriveDialog(false)
      onUpdate?.()
    } catch (error) {
      console.error("Error linking Google Drive folder:", error)
      toast.error("Failed to link Google Drive folder")
    }
  }

  const handleManualNotionLink = async () => {
    try {
      if (!notionPageId.trim()) {
        toast.error("Please enter a valid Notion page ID")
        return
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notionPageId: notionPageId.trim()
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      toast.success("Notion page linked successfully")
      setShowNotionDialog(false)
      onUpdate?.()
    } catch (error) {
      console.error("Error linking Notion page:", error)
      toast.error("Failed to link Notion page")
    }
  }

  const handleUnlinkGoogleDrive = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleDriveFolderId: null
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      toast.success("Google Drive folder unlinked")
      onUpdate?.()
    } catch (error) {
      console.error("Error unlinking Google Drive:", error)
      toast.error("Failed to unlink Google Drive folder")
    }
  }

  const handleUnlinkNotion = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notionPageId: null
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      toast.success("Notion page unlinked")
      onUpdate?.()
    } catch (error) {
      console.error("Error unlinking Notion:", error)
      toast.error("Failed to unlink Notion page")
    }
  }

  const canManageIntegrations = permissions.canEditAllResources || permissions.canCreateProjects

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Project Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect your project with external tools for better collaboration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Drive Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Google Drive</CardTitle>
              </div>
              {project.googleDriveFolderId ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Connected
                </Badge>
              )}
            </div>
            <CardDescription>
              Store and share project files in Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.googleDriveFolderId ? (
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href={`https://drive.google.com/drive/folders/${project.googleDriveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Open Drive Folder
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                {canManageIntegrations && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={handleUnlinkGoogleDrive}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Unlink Folder
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {canManageIntegrations ? (
                  <>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={handleGoogleDriveConnect}
                      disabled={isConnecting === 'google-drive'}
                    >
                      {isConnecting === 'google-drive' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Auto Connect
                    </Button>
                    
                    <Dialog open={showGoogleDriveDialog} onOpenChange={setShowGoogleDriveDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Link className="h-4 w-4 mr-2" />
                          Manual Link
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Link Google Drive Folder</DialogTitle>
                          <DialogDescription>
                            Enter the Google Drive folder ID to link an existing folder to this project.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="googleDriveFolderId">Folder ID</Label>
                            <Input
                              id="googleDriveFolderId"
                              value={googleDriveFolderId}
                              onChange={(e) => setGoogleDriveFolderId(e.target.value)}
                              placeholder="Enter Google Drive folder ID"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              You can find the folder ID in the URL when viewing the folder in Google Drive
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowGoogleDriveDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleManualGoogleDriveLink}>
                            Link Folder
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have permission to manage integrations for this project.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notion Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-gray-800" />
                <CardTitle className="text-base">Notion</CardTitle>
              </div>
              {project.notionPageId ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Not Connected
                </Badge>
              )}
            </div>
            <CardDescription>
              Document project plans and progress in Notion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.notionPageId ? (
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href={`https://notion.so/${project.notionPageId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Open Notion Page
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
                {canManageIntegrations && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={handleUnlinkNotion}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Unlink Page
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {canManageIntegrations ? (
                  <>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={handleNotionConnect}
                      disabled={isConnecting === 'notion'}
                    >
                      {isConnecting === 'notion' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Auto Connect
                    </Button>
                    
                    <Dialog open={showNotionDialog} onOpenChange={setShowNotionDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <Link className="h-4 w-4 mr-2" />
                          Manual Link
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Link Notion Page</DialogTitle>
                          <DialogDescription>
                            Enter the Notion page ID to link an existing page to this project.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="notionPageId">Page ID</Label>
                            <Input
                              id="notionPageId"
                              value={notionPageId}
                              onChange={(e) => setNotionPageId(e.target.value)}
                              placeholder="Enter Notion page ID"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              You can find the page ID in the URL when viewing the page in Notion
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowNotionDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleManualNotionLink}>
                            Link Page
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You don't have permission to manage integrations for this project.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Integration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration Benefits</CardTitle>
          <CardDescription>
            Why connect your project with external tools?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-blue-600" />
                Google Drive Benefits
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Centralized file storage and sharing</li>
                <li>• Real-time collaboration on documents</li>
                <li>• Automatic version control</li>
                <li>• Access from anywhere, any device</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-800" />
                Notion Benefits
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Structured project documentation</li>
                <li>• Task and milestone tracking</li>
                <li>• Team knowledge base</li>
                <li>• Rich content and media support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}