import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar,
  Users,
  Target,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import { auth } from "@/lib/auth"
import { Suspense } from "react"
import PermissionChecker from "@/components/auth/permission-checker"
import { ProjectReportsClient } from "@/components/projects/project-reports-client"

export const metadata: Metadata = {
  title: "Project Reports",
  description: "Generate and view comprehensive project reports and analytics.",
}

export default async function ProjectReportsPage() {
  await auth()
  
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">Project Reports</h1>
                  <p className="text-muted-foreground">
                    Generate comprehensive reports and analytics for project performance tracking.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PermissionChecker 
                    requiredPermission="EXPORT_PROJECT_REPORTS"
                    fallback={null}
                  >
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export All
                    </Button>
                  </PermissionChecker>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-4 md:px-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Departments</p>
                      <p className="text-2xl font-bold">6</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Health</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="px-4 md:px-6">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="custom">Custom Reports</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Summary Report */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Project Summary
                            </CardTitle>
                            <CardDescription>
                              High-level overview of all projects
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Active Projects</p>
                              <p className="text-2xl font-bold text-blue-600">12</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Completed</p>
                              <p className="text-2xl font-bold text-green-600">8</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">On Hold</p>
                              <p className="text-2xl font-bold text-yellow-600">3</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Overdue</p>
                              <p className="text-2xl font-bold text-red-600">2</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">Last updated: Today at 2:30 PM</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Department Performance */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Department Performance
                            </CardTitle>
                            <CardDescription>
                              Performance metrics by department
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            { dept: 'IT', completion: 92, projects: 5, color: 'bg-blue-500' },
                            { dept: 'Outreach', completion: 88, projects: 8, color: 'bg-green-500' },
                            { dept: 'Therapy', completion: 85, projects: 4, color: 'bg-purple-500' },
                            { dept: 'Media', completion: 78, projects: 6, color: 'bg-amber-500' },
                          ].map((item) => (
                            <div key={item.dept} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">{item.dept}</span>
                                <span className="text-muted-foreground">
                                  {item.completion}% • {item.projects} projects
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${item.color}`}
                                  style={{ width: `${item.completion}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Milestone Tracking */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              Milestone Tracking
                            </CardTitle>
                            <CardDescription>
                              Current milestone status across projects
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-green-50 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">34</p>
                              <p className="text-sm text-green-700">Completed</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">18</p>
                              <p className="text-sm text-blue-700">In Progress</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <p className="text-2xl font-bold text-yellow-600">7</p>
                              <p className="text-sm text-yellow-700">Delayed</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                              <p className="text-2xl font-bold text-red-600">3</p>
                              <p className="text-sm text-red-700">Overdue</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Alert Summary */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              Project Alerts
                            </CardTitle>
                            <CardDescription>
                              Issues requiring immediate attention
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">2 projects overdue</p>
                              <p className="text-xs text-muted-foreground">Require immediate attention</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">5 milestones at risk</p>
                              <p className="text-xs text-muted-foreground">May miss deadlines</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <AlertTriangle className="h-4 w-4 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">3 projects need updates</p>
                              <p className="text-xs text-muted-foreground">No progress in 7+ days</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="detailed">
                  <Suspense fallback={<div className="py-8 text-center">Loading detailed reports...</div>}>
                    <ProjectReportsClient />
                  </Suspense>
                </TabsContent>
                
                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Analytics</CardTitle>
                      <CardDescription>
                        Deep dive into project performance metrics and trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Advanced analytics dashboard with interactive charts and trend analysis.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="custom">
                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Report Builder</CardTitle>
                      <CardDescription>
                        Create custom reports with specific metrics and filters
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Custom report builder interface coming soon.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}