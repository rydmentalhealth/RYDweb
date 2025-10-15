"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Target,
  Download,
  ZoomIn,
  ZoomOut,
  Move
} from "lucide-react"
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, addDays, subDays } from "date-fns"

interface GanttChartProps {
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

interface GanttItem {
  id: string
  title: string
  startDate: Date
  endDate: Date
  progress: number
  status: string
  responsibleUser?: string
  type: 'milestone' | 'phase'
}

export function GanttChart({ project }: GanttChartProps) {
  const [zoom, setZoom] = useState<'week' | 'month' | 'quarter'>('month')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [viewStart, setViewStart] = useState<Date>(new Date())
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; date: Date } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  // Calculate project timeline
  const projectStart = project.startDate ? parseISO(project.startDate) : new Date()
  const projectEnd = project.endDate ? parseISO(project.endDate) : addDays(projectStart, 90)
  const projectDuration = differenceInDays(projectEnd, projectStart)

  // Convert milestones to Gantt items
  const ganttItems: GanttItem[] = project.milestones?.map(milestone => ({
    id: milestone.id,
    title: milestone.title,
    startDate: parseISO(milestone.dueDate),
    endDate: parseISO(milestone.dueDate), // Milestones are point-in-time
    progress: milestone.progress,
    status: milestone.status,
    responsibleUser: milestone.responsibleUser ? 
      `${milestone.responsibleUser.firstName} ${milestone.responsibleUser.lastName}` : 
      undefined,
    type: 'milestone' as const
  })) || []

  // Calculate view parameters based on zoom level
  const getViewParameters = () => {
    const daysPerPixel = {
      'week': 1,
      'month': 2,
      'quarter': 7
    }[zoom]

    const viewEnd = addDays(viewStart, 90 / daysPerPixel)
    
    return {
      daysPerPixel,
      viewStart,
      viewEnd,
      totalDays: differenceInDays(viewEnd, viewStart),
      pixelsPerDay: 20 / daysPerPixel
    }
  }

  const viewParams = getViewParameters()

  // Calculate item positions
  const getItemPosition = (item: GanttItem) => {
    const startOffset = differenceInDays(item.startDate, viewParams.viewStart)
    const duration = differenceInDays(item.endDate, item.startDate) + 1
    
    return {
      left: startOffset * viewParams.pixelsPerDay,
      width: Math.max(duration * viewParams.pixelsPerDay, 4), // Minimum width for visibility
      isVisible: item.startDate <= viewParams.viewEnd && item.endDate >= viewParams.viewStart
    }
  }

  // Generate timeline headers
  const generateTimelineHeaders = () => {
    const headers = []
    const current = new Date(viewParams.viewStart)
    
    while (current <= viewParams.viewEnd) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6
      const isToday = format(current, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      
      headers.push({
        date: new Date(current),
        isWeekend,
        isToday,
        label: format(current, zoom === 'week' ? 'EEE d' : zoom === 'month' ? 'MMM d' : 'MMM')
      })
      
      current.setDate(current.getDate() + 1)
    }
    
    return headers
  }

  const timelineHeaders = generateTimelineHeaders()

  // Handle zoom changes
  const handleZoomChange = (newZoom: 'week' | 'month' | 'quarter') => {
    setZoom(newZoom)
    setViewStart(new Date()) // Reset to current date
  }

  // Handle drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === chartRef.current) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX,
        date: new Date(viewStart)
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && dragStart) {
      const deltaX = e.clientX - dragStart.x
      const deltaDays = Math.round(deltaX / viewParams.pixelsPerDay)
      const newStart = subDays(dragStart.date, deltaDays)
      setViewStart(newStart)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
  }

  // Export chart as image
  const exportChart = () => {
    if (chartRef.current) {
      // TODO: Implement chart export functionality
      console.log('Exporting Gantt chart...')
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500'
      case 'IN_PROGRESS':
        return 'bg-blue-500'
      case 'DELAYED':
        return 'bg-yellow-500'
      case 'OVERDUE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'DELAYED':
        return 'Delayed'
      case 'OVERDUE':
        return 'Overdue'
      default:
        return 'Planned'
    }
  }

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={zoom === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleZoomChange('week')}
          >
            Week
          </Button>
          <Button
            variant={zoom === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleZoomChange('month')}
          >
            Month
          </Button>
          <Button
            variant={zoom === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleZoomChange('quarter')}
          >
            Quarter
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportChart}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
          <CardDescription>
            Drag to pan, scroll to zoom. Click on items for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div 
              ref={chartRef}
              className="relative min-w-full"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* Timeline Header */}
              <div className="sticky top-0 z-10 bg-background border-b">
                <div className="flex">
                  <div className="w-64 p-2 border-r bg-muted/50">
                    <span className="text-sm font-medium">Milestones</span>
                  </div>
                  <div className="flex-1 flex">
                    {timelineHeaders.map((header, index) => (
                      <div
                        key={index}
                        className={`p-2 text-xs text-center border-r min-w-[${viewParams.pixelsPerDay}px] ${
                          header.isWeekend ? 'bg-muted/30' : ''
                        } ${header.isToday ? 'bg-blue-100 border-blue-300' : ''}`}
                        style={{ minWidth: `${viewParams.pixelsPerDay}px` }}
                      >
                        <div className="font-medium">{header.label}</div>
                        <div className="text-muted-foreground">
                          {format(header.date, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Timeline Bar */}
              <div className="flex border-b">
                <div className="w-64 p-2 border-r bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{project.name}</span>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="h-8 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-800">
                      {format(projectStart, 'MMM d')} - {format(projectEnd, 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {ganttItems.map((item) => {
                const position = getItemPosition(item)
                const isOverdue = item.endDate < new Date() && item.status !== 'COMPLETED'
                
                if (!position.isVisible) return null

                return (
                  <div key={item.id} className="flex border-b hover:bg-muted/20">
                    <div className="w-64 p-2 border-r">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      {item.responsibleUser && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.responsibleUser}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <div
                        className={`absolute top-1 h-6 rounded border cursor-pointer hover:shadow-md transition-shadow ${
                          isOverdue ? 'border-red-300 bg-red-100' : getStatusColor(item.status)
                        }`}
                        style={{
                          left: `${position.left}px`,
                          width: `${position.width}px`,
                          backgroundColor: isOverdue ? '#fef2f2' : undefined
                        }}
                        onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                      >
                        <div className="flex items-center justify-between h-full px-2">
                          <span className="text-xs font-medium text-white truncate">
                            {item.title}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-white/20 border-white/30 text-white"
                          >
                            {item.progress}%
                          </Badge>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b">
                          <div
                            className="h-full bg-white/60 rounded-b"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Today's line */}
              <div className="absolute top-0 bottom-0 w-px bg-red-500 z-20"
                   style={{
                     left: `${differenceInDays(new Date(), viewParams.viewStart) * viewParams.pixelsPerDay + 256}px`
                   }}>
                <div className="absolute -top-2 -left-1 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Milestone Details</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const item = ganttItems.find(i => i.id === selectedItem)
              if (!item) return null
              
              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(item.startDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      <span className="text-sm">{getStatusText(item.status)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Progress:</span>
                      <div className="w-20">
                        <Progress value={item.progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{item.progress}%</span>
                    </div>
                  </div>
                  
                  {item.responsibleUser && (
                    <div>
                      <span className="text-sm text-muted-foreground">Responsible:</span>
                      <span className="text-sm ml-2">{item.responsibleUser}</span>
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span>Planned</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}