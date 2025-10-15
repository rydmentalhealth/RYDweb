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
  ExternalLink,
  FolderOpen,
  BookOpen,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { format, parseISO, isPast, isFuture } from "date-fns"
import { ProjectTimeline } from "./project-timeline"
import { ProjectMilestones } from "./project-milestones"
import { ProjectProgressUpdates } from "./project-progress-updates"
import { ProjectResources } from "./project-resources"
import { ProjectTeam } from "./project-team"

interface ProjectMobileViewProps {
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
      responsibleUser?: {
        firstName: string
        lastName: string
      }
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

export function ProjectMobileView({ project }: ProjectMobileViewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["overview"]))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

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
    <div className="space-y-4 p-4">
      {/* Project Header - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <div className="space-y-3">
            <div>
              <CardTitle className="text-xl leading-tight">{project.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {project.description || "No description provided"}
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
              {project.department && (
                <Badge variant="outline">
                  {project.department}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{calculateProjectProgress()}%</span>
            </div>
            <Progress value={calculateProjectProgress()} className="h-2" />
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {project.members?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {project.milestones?.filter(m => m.status === 'COMPLETED').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Completed Milestones</div>
            </div>
          </div>

          {/* Integration Links */}
          {(project.googleDriveFolderId || project.notionPageId) && (
            <div className="flex gap-2 mt-4">
              {project.googleDriveFolderId && (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a 
                    href={`https://drive.google.com/drive/folders/${project.googleDriveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Google Drive
                  </a>
                </Button>
              )}
              {project.notionPageId && (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a 
                    href={`https://notion.so/${project.notionPageId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Notion
                  </a>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collapsible Sections */}
      <div className="space-y-3">
        {/* Timeline Section */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('timeline')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
              {expandedSections.has('timeline') ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('timeline') && (
            <CardContent className="pt-0">
              <ProjectTimeline project={project} />
            </CardContent>
          )}
        </Card>

        {/* Milestones Section */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('milestones')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Milestones
                {project.milestones && (
                  <Badge variant="secondary" className="ml-2">
                    {project.milestones.length}
                  </Badge>
                )}
              </CardTitle>
              {expandedSections.has('milestones') ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('milestones') && (
            <CardContent className="pt-0">
              <ProjectMilestones project={project} />
            </CardContent>
          )}
        </Card>

        {/* Progress Updates Section */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('progress')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Progress Updates
                {project.progressUpdates && (
                  <Badge variant="secondary" className="ml-2">
                    {project.progressUpdates.length}
                  </Badge>
                )}
              </CardTitle>
              {expandedSections.has('progress') ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('progress') && (
            <CardContent className="pt-0">
              <ProjectProgressUpdates project={project} />
            </CardContent>
          )}
        </Card>

        {/* Team Section */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('team')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
                {project.members && (
                  <Badge variant="secondary" className="ml-2">
                    {project.members.length}
                  </Badge>
                )}
              </CardTitle>
              {expandedSections.has('team') ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('team') && (
            <CardContent className="pt-0">
              <ProjectTeam project={project} />
            </CardContent>
          )}
        </Card>

        {/* Resources Section */}
        <Card>
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => toggleSection('resources')}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resources
              </CardTitle>
              {expandedSections.has('resources') ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          {expandedSections.has('resources') && (
            <CardContent className="pt-0">
              <ProjectResources project={project} />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Smart Alerts */}
      {project.milestones?.some(milestone => 
        isPast(parseISO(milestone.dueDate)) && milestone.status !== 'COMPLETED'
      ) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-medium">Overdue Milestones</h4>
                <p className="text-sm">
                  Some milestones are overdue. Please review and update their status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isOverdue && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              <div>
                <h4 className="font-medium">Project Overdue</h4>
                <p className="text-sm">
                  This project is past its expected end date. Please review the timeline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}