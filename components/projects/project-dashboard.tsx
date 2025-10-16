"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
  BookOpen,
  Bell,
  TrendingUp,
  Activity,
  Download,
  Upload,
  MessageSquare,
  BarChart3,
  AlertTriangle
} from "lucide-react"
import { format, isPast, parseISO, formatDistanceToNow } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

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
    projectLead?: {
      id: string
      firstName: string
      lastName: string
      avatar?: string
    }
    owner?: {
      id: string
      firstName: string
      lastName: string
      avatar?: string
    }
    members?: Array<{
      id: string
      firstName: string
      lastName: string
      avatar?: string
      role?: string
    }>
    milestones?: Array<{
      id: string
      title: string
      description?: string
      dueDate: string
      progress: number
      status: string
      responsibleUser?: {
        id: string
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
      isApproved: boolean
      createdAt: string
      user: {
        firstName: string
        lastName: string
        avatar?: string
      }
      approvedBy?: {
        firstName: string
        lastName: string
      }
    }>
    tasks?: Array<{
      id: string
      title: string
      status: string
      priority: string
    }>
    resources?: Array<{
      id: string
      fileName: string
      fileUrl: string
      fileType: string
      createdAt: string
      uploadedBy: {
        firstName: string
        lastName: string
      }
    }>
  }
}

export function ProjectDashboard({ project }: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch project milestones
  const { data: milestones = [], isLoading: milestonesLoading } = useQuery({
    queryKey: ["project-milestones", project.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${project.id}/milestones`)
      if (!response.ok) throw new Error("Failed to fetch milestones")
      return response.json()
    }
  })

  // Fetch progress updates
  const { data: progressUpdates = [], isLoading: progressLoading } = useQuery({
    queryKey: ["project-progress", project.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${project.id}/progress`)
      if (!response.ok) throw new Error("Failed to fetch progress updates")
      return response.json()
    }
  })

  // Fetch project notifications
  const { data: notifications = { notifications: [] } } = useQuery({
    queryKey: ["project-notifications"],
    queryFn: async () => {
      const response = await fetch("/api/projects/notifications")
      if (!response.ok) throw new Error("Failed to fetch notifications")
      return response.json()
    }
  })

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

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProjectProgress = () => {
    if (!milestones || milestones.length === 0) {
      // Fallback to task-based progress if no milestones
      if (!project.tasks || project.tasks.length === 0) return 0
      const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length
      return Math.round((completedTasks / project.tasks.length) * 100)
    }
    const totalProgress = milestones.reduce((sum: number, milestone: any) => sum + milestone.progress, 0)
    return Math.round(totalProgress / milestones.length)
  }

  const isOverdue = project.endDate && isPast(parseISO(project.endDate)) && project.status !== 'COMPLETED'

  // Get project-specific notifications
  const projectNotifications = notifications.notifications?.filter((notif: any) => 
    notif.projectId === project.id
  ) || []

  // Calculate project health score
  const calculateHealthScore = () => {
    let score = 100
    
    // Deduct for overdue milestones
    const overdueMilestones = milestones.filter((m: any) => 
      m.status !== 'COMPLETED' && isPast(parseISO(m.dueDate))
    ).length
    score -= overdueMilestones * 20
    
    // Deduct for no recent progress updates
    const recentUpdates = progressUpdates.filter((update: any) => {
      const updateDate = new Date(update.createdAt)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return updateDate >= sevenDaysAgo
    })
    if (recentUpdates.length === 0 && project.status === 'ACTIVE') {
      score -= 30
    }
    
    // Deduct for low completion rate
    const progress = calculateProjectProgress()
    if (progress < 50) score -= 20
    else if (progress < 75) score -= 10
    
    return Math.max(0, score)
  }

  return (
    <div className="space-y-6">
      {/* Project Alerts */}
      {projectNotifications.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-amber-800">Project Alerts ({projectNotifications.length})</p>
              {projectNotifications.slice(0, 2).map((notif: any) => (
                <p key={notif.id} className="text-sm text-amber-700">• {notif.message}</p>
              ))}
              {projectNotifications.length > 2 && (
                <p className="text-sm text-amber-600">+ {projectNotifications.length - 2} more alerts</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                {project.department && (
                  <Badge variant="outline" className="text-xs">
                    {project.department}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {project.description || "No description provided"}
              </CardDescription>
              
              {/* Project Lead & Owner */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {project.owner && (
                  <div className="flex items-center gap-2">
                    <span>Owner:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={project.owner.avatar} />
                        <AvatarFallback className="text-xs">
                          {project.owner.firstName?.[0]}{project.owner.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{project.owner.firstName} {project.owner.lastName}</span>
                    </div>
                  </div>
                )}
                {project.projectLead && (
                  <div className="flex items-center gap-2">
                    <span>Lead:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={project.projectLead.avatar} />
                        <AvatarFallback className="text-xs">
                          {project.projectLead.firstName?.[0]}{project.projectLead.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{project.projectLead.firstName} {project.projectLead.lastName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
              {/* Health Score */}
              <Badge 
                variant="outline" 
                className={`${calculateHealthScore() >= 80 ? 'border-green-500 text-green-700' : 
                  calculateHealthScore() >= 60 ? 'border-yellow-500 text-yellow-700' : 
                  'border-red-500 text-red-700'}`}
              >
                Health: {calculateHealthScore()}%
              </Badge>
            </div>
          </div>
          
          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
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
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Milestones</p>
                <p className="text-sm font-medium">
                  {milestones.filter((m: any) => m.status === 'COMPLETED').length}/{milestones.length}
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              {project.googleDriveFolderId && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://drive.google.com/drive/folders/${project.googleDriveFolderId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Google Drive
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
                    Notion
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                  <Badge variant="outline" className="ml-auto">
                    {project.members?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.members && project.members.length > 0 ? (
                  <div className="space-y-3">
                    {project.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                          {member.role && (
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No team members assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recent Milestones
                  <Badge variant="outline" className="ml-auto">
                    {milestones.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {milestones && milestones.length > 0 ? (
                  <div className="space-y-3">
                    {milestones.slice(0, 4).map((milestone: any) => (
                      <div key={milestone.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{milestone.title}</span>
                          <Badge className={getMilestoneStatusColor(milestone.status)} variant="outline">
                            {milestone.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Due: {format(parseISO(milestone.dueDate), 'MMM d')}</span>
                          <span>{milestone.progress}% complete</span>
                        </div>
                        <Progress value={milestone.progress} className="h-1" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No milestones created</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressUpdates && progressUpdates.length > 0 ? (
                  <div className="space-y-3">
                    {progressUpdates.slice(0, 4).map((update: any) => (
                      <div key={update.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={update.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {update.user.firstName?.[0]}{update.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{update.user.firstName} {update.user.lastName}</span>
                              {' '}submitted progress update
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(parseISO(update.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant={update.isApproved ? "default" : "secondary"} className="text-xs">
                              {update.progressPercentage}%
                            </Badge>
                            {!update.isApproved && (
                              <Clock className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Project Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks</p>
                    <p className="text-2xl font-bold">
                      {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0}/
                      {project.tasks?.length || 0}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Milestones</p>
                    <p className="text-2xl font-bold">
                      {milestones.filter((m: any) => m.status === 'COMPLETED').length}/
                      {milestones.length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Progress Updates</p>
                    <p className="text-2xl font-bold">{progressUpdates.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Health Score</p>
                    <p className="text-2xl font-bold">{calculateHealthScore()}%</p>
                  </div>
                  <BarChart3 className={`h-8 w-8 ${
                    calculateHealthScore() >= 80 ? 'text-green-500' : 
                    calculateHealthScore() >= 60 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Timeline</CardTitle>
                  <CardDescription>Visual timeline of project phases and milestones</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Timeline
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {milestones && milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone: any, index: number) => (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'COMPLETED' ? 'bg-green-500' :
                          milestone.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                          milestone.status === 'OVERDUE' ? 'bg-red-500' :
                          'bg-gray-300'
                        }`} />
                        {index < milestones.length - 1 && (
                          <div className="w-px h-16 bg-gray-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={getMilestoneStatusColor(milestone.status)} variant="outline">
                              {milestone.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(parseISO(milestone.dueDate), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <Progress value={milestone.progress} className="h-2 flex-1 mr-4" />
                          <span className="text-sm font-medium">{milestone.progress}%</span>
                        </div>
                        {milestone.responsibleUser && (
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs">
                                {milestone.responsibleUser.firstName?.[0]}{milestone.responsibleUser.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {milestone.responsibleUser.firstName} {milestone.responsibleUser.lastName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No milestones created yet</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Milestone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Milestones</CardTitle>
                  <CardDescription>Track project milestones and their progress</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {milestones && milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone: any) => (
                    <Card key={milestone.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h4 className="font-medium">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMilestoneStatusColor(milestone.status)} variant="outline">
                            {milestone.status}
                          </Badge>
                          {isPast(parseISO(milestone.dueDate)) && milestone.status !== 'COMPLETED' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="text-sm font-medium">
                            {format(parseISO(milestone.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Progress</p>
                          <p className="text-sm font-medium">{milestone.progress}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Responsible</p>
                          <p className="text-sm font-medium">
                            {milestone.responsibleUser ? 
                              `${milestone.responsibleUser.firstName} ${milestone.responsibleUser.lastName}` : 
                              'Unassigned'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <Progress value={milestone.progress} className="h-2" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No milestones created yet</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Milestone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Progress Updates</CardTitle>
                  <CardDescription>Daily progress reports from team members</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Update
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {progressUpdates && progressUpdates.length > 0 ? (
                <div className="space-y-4">
                  {progressUpdates.map((update: any) => (
                    <Card key={update.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={update.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {update.user.firstName?.[0]}{update.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{update.user.firstName} {update.user.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDistanceToNow(parseISO(update.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={update.isApproved ? "default" : "secondary"}>
                            {update.progressPercentage}% Progress
                          </Badge>
                          {update.isApproved ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Task/Activity Completed:</p>
                          <p className="text-sm text-muted-foreground">{update.taskActivity}</p>
                        </div>
                        
                        {update.challenges && (
                          <div>
                            <p className="text-sm font-medium">Challenges:</p>
                            <p className="text-sm text-muted-foreground">{update.challenges}</p>
                          </div>
                        )}
                        
                        {update.nextPlan && (
                          <div>
                            <p className="text-sm font-medium">Next Day's Plan:</p>
                            <p className="text-sm text-muted-foreground">{update.nextPlan}</p>
                          </div>
                        )}
                        
                        {update.approvedBy && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              Approved by {update.approvedBy.firstName} {update.approvedBy.lastName}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No progress updates yet</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit First Update
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Resources</CardTitle>
                  <CardDescription>Files, documents, and resources for this project</CardDescription>
                </div>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.resources && project.resources.length > 0 ? (
                <div className="space-y-3">
                  {project.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{resource.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded by {resource.uploadedBy.firstName} {resource.uploadedBy.lastName} • {' '}
                            {formatDistanceToNow(parseISO(resource.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No resources uploaded yet</p>
                  <Button className="mt-4" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload First File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Health</CardTitle>
                <CardDescription>Overall project performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Health Score</span>
                    <span className="font-medium">{calculateHealthScore()}%</span>
                  </div>
                  <Progress value={calculateHealthScore()} className="h-2" />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Milestone Completion</span>
                    <span className="text-sm font-medium">
                      {milestones.filter((m: any) => m.status === 'COMPLETED').length}/{milestones.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overdue Milestones</span>
                    <span className="text-sm font-medium text-red-600">
                      {milestones.filter((m: any) => 
                        m.status !== 'COMPLETED' && isPast(parseISO(m.dueDate))
                      ).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Recent Updates</span>
                    <span className="text-sm font-medium">
                      {progressUpdates.filter((u: any) => {
                        const updateDate = new Date(u.createdAt)
                        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        return updateDate >= sevenDaysAgo
                      }).length} this week
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Team member contribution and activity</CardDescription>
              </CardHeader>
              <CardContent>
                {project.members && project.members.length > 0 ? (
                  <div className="space-y-3">
                    {project.members.map((member) => {
                      const memberUpdates = progressUpdates.filter((u: any) => 
                        u.user.firstName === member.firstName && u.user.lastName === member.lastName
                      ).length
                      
                      return (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-xs">
                                {member.firstName?.[0]}{member.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.firstName} {member.lastName}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{memberUpdates} updates</p>
                            <p className="text-xs text-muted-foreground">
                              {member.role || 'Member'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No team members to analyze</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}