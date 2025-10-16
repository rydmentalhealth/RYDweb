"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  Eye,
  Loader2,
  BarChart3,
  TrendingUp,
  Users,
  Target
} from "lucide-react"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ReportFilter {
  department?: string
  startDate?: Date
  endDate?: Date
  type: 'summary' | 'detailed' | 'milestones' | 'all'
}

export function ProjectReportsClient() {
  const [filters, setFilters] = useState<ReportFilter>({
    type: 'summary'
  })
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch available reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["project-reports"],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return [
        {
          id: '1',
          title: 'Monthly Project Summary - October 2024',
          type: 'summary',
          department: 'All Departments',
          generatedAt: '2024-10-15T10:30:00Z',
          generatedBy: 'System',
          fileUrl: '/reports/monthly-summary-oct-2024.pdf',
          status: 'completed'
        },
        {
          id: '2',
          title: 'IT Department Detailed Report',
          type: 'detailed',
          department: 'IT',
          generatedAt: '2024-10-14T14:20:00Z',
          generatedBy: 'John Doe',
          fileUrl: '/reports/it-detailed-oct-2024.pdf',
          status: 'completed'
        },
        {
          id: '3',
          title: 'Milestone Tracking Report',
          type: 'milestones',
          department: 'All Departments',
          generatedAt: '2024-10-13T09:15:00Z',
          generatedBy: 'Jane Smith',
          fileUrl: '/reports/milestones-oct-2024.pdf',
          status: 'completed'
        },
        {
          id: '4',
          title: 'Outreach Department Performance',
          type: 'detailed',
          department: 'Outreach',
          generatedAt: '2024-10-12T16:45:00Z',
          generatedBy: 'Mike Johnson',
          fileUrl: '/reports/outreach-performance-oct-2024.pdf',
          status: 'completed'
        }
      ]
    }
  })

  const generateReport = async () => {
    setIsGenerating(true)
    try {
      const params = new URLSearchParams()
      params.append("type", filters.type)
      if (filters.department) params.append("department", filters.department)
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString())
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString())
      
      const response = await fetch(`/api/reports/project-summary?${params}`)
      if (!response.ok) throw new Error("Failed to generate report")
      
      const reportData = await response.json()
      
      // Create and download the report
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `project-report-${filters.type}-${format(new Date(), 'yyyy-MM-dd')}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      toast.success("Report generated and downloaded successfully")
    } catch (error) {
      toast.error("Failed to generate report")
      console.error("Report generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <BarChart3 className="h-4 w-4" />
      case 'detailed':
        return <FileText className="h-4 w-4" />
      case 'milestones':
        return <Target className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'summary':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">Summary</Badge>
      case 'detailed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Detailed</Badge>
      case 'milestones':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">Milestones</Badge>
      default:
        return <Badge variant="outline">Report</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
          <CardDescription>
            Create custom reports with specific filters and date ranges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Project Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="milestones">Milestone Report</SelectItem>
                  <SelectItem value="all">Comprehensive Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select 
                value={filters.department || "all"} 
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  department: value === "all" ? undefined : value 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="OUTREACH">Outreach</SelectItem>
                  <SelectItem value="THERAPY">Therapy</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="RESEARCH">Research</SelectItem>
                  <SelectItem value="ADMINISTRATION">Administration</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? (
                      format(filters.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? (
                      format(filters.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={generateReport} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ type: 'summary' })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Previously generated project reports and analytics
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-64" />
                    <div className="h-3 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{report.title}</h4>
                        {getReportTypeBadge(report.type)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Department: {report.department}</span>
                        <span>Generated: {format(new Date(report.generatedAt), 'MMM d, yyyy at h:mm a')}</span>
                        <span>By: {report.generatedBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={report.fileUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reports generated yet</p>
              <p className="text-sm text-muted-foreground">Generate your first report using the form above</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Quick access to commonly used report formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Weekly Summary',
                description: 'High-level overview of weekly progress',
                icon: <BarChart3 className="h-5 w-5" />,
                filters: { type: 'summary' as const }
              },
              {
                title: 'Department Deep Dive',
                description: 'Detailed analysis of department performance',
                icon: <Users className="h-5 w-5" />,
                filters: { type: 'detailed' as const }
              },
              {
                title: 'Milestone Tracker',
                description: 'Status of all project milestones',
                icon: <Target className="h-5 w-5" />,
                filters: { type: 'milestones' as const }
              },
              {
                title: 'Performance Trends',
                description: 'Long-term performance analysis',
                icon: <TrendingUp className="h-5 w-5" />,
                filters: { type: 'all' as const }
              }
            ].map((template) => (
              <Card key={template.title} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{template.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setFilters(template.filters)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}