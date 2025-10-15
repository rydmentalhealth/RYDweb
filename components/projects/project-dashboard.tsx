"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, 
  Users, 
  Target, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ExternalLink,
  FolderOpen,
  BookOpen
} from "lucide-react"
import { format, isPast, parseISO } from "date-fns"

interface ProjectDashboardProps {
  project: {
    id: string
    name: string
    description?: string
    status: string
    priority: string
    department?: string
    startDate?: string
    endDate?: string
    googleDriveFolderId?: string
    notionPageId?: string
    members?: Array<{
      id: string
      firstName: string
      lastName: string
      avatar?: string
    }>
    milestones?: Array<{
      id: string
      title: string
      description?: string
      dueDate: string
      progress: number
      status: string
    }>
    progressUpdates?: Array<{
      id: string
      taskActivity: string
      progressPercentage: number
      challenges?: string
      nextPlan?: string
      createdAt: string
      user: {
        firstName: string
        lastName: string
        avatar?: string
      }
    }>
  }
}

export function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800'
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-green-100 text-green-800'
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800'
      case 'HIGH':
        return 'bg-amber-100 text-amber-800'
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProjectProgress = () => {
    if (!project.milestones || project.milestones.length === 0) return 0
    const totalProgress = project.milestones.reduce((sum, milestone) => sum + milestone.progress, 0)
    return Math.round(totalProgress / project.milestones.length)
  }

  const isOverdue = project.endDate && isPast(parseISO(project.endDate)) && project.status !== 'COMPLETED'

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription className="text-base">
                {project.description || "No description provided"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
            </div>
          </div>
          
          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-sm font-medium">
                  {project.startDate ? format(parseISO(project.startDate), 'MMM d, yyyy') : 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {project.endDate ? format(parseISO(project.endDate), 'MMM d, yyyy') : 'Not set'}
                  {isOverdue && ' (Overdue)'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-sm font-medium">
                  {project.members?.length || 0} members
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-sm font-medium">
                  {calculateProjectProgress()}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{calculateProjectProgress()}%</span>
            </div>
            <Progress value={calculateProjectProgress()} className="h-2" />
          </div>

          {/* Integration Links */}
          {(project.googleDriveFolderId || project.notionPageId) && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              {project.googleDriveFolderId && (
                <Button variant="outline" size="sm" asChild>
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
                <Button variant="outline" size="sm" asChild>
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
          )}
        </CardHeader>
      </Card>

      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.members && project.members.length > 0 ? (
                  <div className="space-y-2">
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {member.avatar ? (
                            <img src={member.avatar} alt={`${member.firstName} ${member.lastName}`} className="h-8 w-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-sm">{member.firstName} {member.lastName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No team members assigned</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recent Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.milestones && project.milestones.length > 0 ? (
                  <div className="space-y-2">
                    {project.milestones.slice(0, 3).map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between">
                        <span className="text-sm">{milestone.title}</span>
                        <Badge variant="outline">{milestone.progress}%</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No milestones created</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Visual timeline of project phases and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Timeline visualization coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
              <CardDescription>Track project milestones and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Milestone management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress Updates</CardTitle>
              <CardDescription>Daily progress reports from team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Progress tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Project Resources</CardTitle>
              <CardDescription>Files, documents, and resources for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Resource management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}