"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Eye
} from "lucide-react"
import { GanttChart } from "./gantt-chart"
import { format, parseISO, differenceInDays, isPast, isFuture } from "date-fns"

interface ProjectTimelineProps {
  project: {
    id: string
    name: string
    startDate?: string
    endDate?: string
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
  }
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  const [viewMode, setViewMode] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)

  const getMilestoneStatusColor = (status: string, dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status !== 'COMPLETED'
    
    if (isOverdue) return 'bg-red-100 text-red-800 border-red-200'
    
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMilestoneStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = isPast(parseISO(dueDate)) && status !== 'COMPLETED'
    
    if (isOverdue) return <AlertCircle className="h-4 w-4" />
    
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const calculateTimelinePosition = (dueDate: string) => {
    if (!project.startDate || !project.endDate) return 0
    
    const start = parseISO(project.startDate)
    const end = parseISO(project.endDate)
    const milestone = parseISO(dueDate)
    
    const totalDays = differenceInDays(end, start)
    const daysFromStart = differenceInDays(milestone, start)
    
    return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100))
  }

  const exportTimeline = () => {
    // TODO: Implement timeline export functionality
    console.log('Exporting timeline...')
  }

  const projectDuration = project.startDate && project.endDate 
    ? differenceInDays(parseISO(project.endDate), parseISO(project.startDate))
    : 0

  return (
    <div className="space-y-6">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('quarter')}
          >
            Quarter
          </Button>
          <Button
            variant={viewMode === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('year')}
          >
            Year
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportTimeline}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Gantt Chart View */}
      <GanttChart project={project} />

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>
            {project.startDate && project.endDate ? (
              <>
                {format(parseISO(project.startDate), 'MMM d, yyyy')} - {format(parseISO(project.endDate), 'MMM d, yyyy')}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({projectDuration} days)
                </span>
              </>
            ) : (
              'No timeline set'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.startDate && project.endDate ? (
            <div className="space-y-4">
              {/* Timeline Bar */}
              <div className="relative">
                <div className="h-8 bg-gray-200 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 opacity-20"></div>
                  
                  {/* Milestone Markers */}
                  {project.milestones?.map((milestone) => {
                    const position = calculateTimelinePosition(milestone.dueDate)
                    const isOverdue = isPast(parseISO(milestone.dueDate)) && milestone.status !== 'COMPLETED'
                    
                    return (
                      <div
                        key={milestone.id}
                        className="absolute top-1/2 transform -translate-y-1/2"
                        style={{ left: `${position}%` }}
                      >
                        <div className="relative group">
                          <div className={`w-3 h-3 rounded-full border-2 ${getMilestoneStatusColor(milestone.status, milestone.dueDate)} cursor-pointer hover:scale-125 transition-transform`}
                               onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}>
                          </div>
                          
                          {/* Milestone Label */}
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black text-white text-xs px-2 py-1 rounded">
                              {milestone.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Timeline Labels */}
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Start</span>
                  <span>End</span>
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <h4 className="font-medium">Milestones</h4>
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((milestone) => {
                    const isOverdue = isPast(parseISO(milestone.dueDate)) && milestone.status !== 'COMPLETED'
                    const isUpcoming = isFuture(parseISO(milestone.dueDate))
                    
                    return (
                      <div
                        key={milestone.id}
                        className={`p-3 rounded-lg border ${getMilestoneStatusColor(milestone.status, milestone.dueDate)} ${
                          selectedMilestone === milestone.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedMilestone(selectedMilestone === milestone.id ? null : milestone.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getMilestoneStatusIcon(milestone.status, milestone.dueDate)}
                            <div>
                              <h5 className="font-medium">{milestone.title}</h5>
                              {milestone.description && (
                                <p className="text-sm opacity-75">{milestone.description}</p>
                              )}
                              {milestone.responsibleUser && (
                                <p className="text-xs opacity-75">
                                  Responsible: {milestone.responsibleUser.firstName} {milestone.responsibleUser.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {format(parseISO(milestone.dueDate), 'MMM d, yyyy')}
                              </p>
                              {isOverdue && (
                                <p className="text-xs text-red-600">Overdue</p>
                              )}
                              {isUpcoming && (
                                <p className="text-xs text-blue-600">Upcoming</p>
                              )}
                            </div>
                            
                            <div className="w-20">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{milestone.progress}%</span>
                              </div>
                              <Progress value={milestone.progress} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No milestones created yet</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timeline set for this project</p>
              <p className="text-sm text-muted-foreground">Set start and end dates to view the timeline</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Delay Alert */}
      {project.milestones?.some(milestone => 
        isPast(parseISO(milestone.dueDate)) && milestone.status !== 'COMPLETED'
      ) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-medium">Smart Delay Alert</h4>
                <p className="text-sm">
                  Some milestones are overdue. Please review and update their status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}