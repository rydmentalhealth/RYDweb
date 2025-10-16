"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  FolderKanban, 
  Calendar,
  DollarSign,
  Target,
  Activity,
  Award
} from "lucide-react"
import { usePermissions } from "@/lib/hooks/usePermissions"

// Mock analytics data - replace with real API calls
const organizationMetrics = {
  totalUsers: 247,
  activeProjects: 12,
  completedTasks: 1847,
  monthlyBudget: 45000000,
  growthRate: 15.2,
  efficiency: 87.5
}

const userGrowthData = [
  { month: 'Jan', users: 180, active: 165 },
  { month: 'Feb', users: 195, active: 178 },
  { month: 'Mar', users: 210, active: 192 },
  { month: 'Apr', users: 225, active: 205 },
  { month: 'May', users: 235, active: 218 },
  { month: 'Jun', users: 247, active: 230 }
]

const projectProgressData = [
  { month: 'Jan', completed: 8, ongoing: 15, planned: 5 },
  { month: 'Feb', completed: 12, ongoing: 18, planned: 7 },
  { month: 'Mar', completed: 15, ongoing: 16, planned: 8 },
  { month: 'Apr', completed: 18, ongoing: 14, planned: 6 },
  { month: 'May', completed: 22, ongoing: 12, planned: 4 },
  { month: 'Jun', completed: 25, ongoing: 12, planned: 3 }
]

const departmentPerformance = [
  { name: 'Mental Health', performance: 95, budget: 12000000, projects: 4 },
  { name: 'Community Outreach', performance: 88, budget: 8500000, projects: 3 },
  { name: 'Youth Programs', performance: 82, budget: 7200000, projects: 2 },
  { name: 'Refugee Support', performance: 79, budget: 9800000, projects: 2 },
  { name: 'Disability Services', performance: 75, budget: 7500000, projects: 1 }
]

const roleDistribution = [
  { name: 'Volunteers', value: 155, color: '#86EFAC' },
  { name: 'Staff', value: 67, color: '#4ADE80' },
  { name: 'Team Leads', value: 15, color: '#22C55E' },
  { name: 'Admins', value: 8, color: '#16A34A' },
  { name: 'Super Admins', value: 2, color: '#0B874E' }
]

const taskCompletionTrends = [
  { week: 'Week 1', completed: 145, assigned: 160 },
  { week: 'Week 2', completed: 168, assigned: 180 },
  { week: 'Week 3', completed: 152, assigned: 170 },
  { week: 'Week 4', completed: 189, assigned: 200 }
]

export function AnalyticsOverview() {
  const permissions = usePermissions()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
        <p className="text-muted-foreground">
          Comprehensive insights into organizational performance and metrics
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="border-l-4 border-l-ryd">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationMetrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{organizationMetrics.growthRate}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationMetrics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationMetrics.completedTasks}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        {permissions.canViewReports && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(organizationMetrics.monthlyBudget)}</div>
              <p className="text-xs text-muted-foreground">Current allocation</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizationMetrics.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Excellent</div>
            <p className="text-xs text-muted-foreground">Overall rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Growth</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Growth Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Growth Trend
                </CardTitle>
                <CardDescription>Total and active users over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#0B874E" 
                        strokeWidth={3}
                        name="Total Users"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="active" 
                        stroke="#16A34A" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Active Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Current distribution of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {roleDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Detailed user activity and engagement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stackId="1" 
                        stroke="#0B874E" 
                        fill="#0B874E" 
                        fillOpacity={0.8}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="active" 
                        stackId="2" 
                        stroke="#16A34A" 
                        fill="#16A34A" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Progress Over Time</CardTitle>
                <CardDescription>Track project completion and planning trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#0B874E" name="Completed" />
                      <Bar dataKey="ongoing" fill="#16A34A" name="Ongoing" />
                      <Bar dataKey="planned" fill="#86EFAC" name="Planned" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Completion Trends</CardTitle>
                <CardDescription>Weekly task completion vs assignment rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={taskCompletionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#0B874E" 
                        strokeWidth={3}
                        name="Completed Tasks"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="assigned" 
                        stroke="#94A3B8" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Assigned Tasks"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Analysis</CardTitle>
              <CardDescription>Performance metrics and budget allocation by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {departmentPerformance.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{dept.name}</span>
                        <div className="text-sm text-muted-foreground">
                          {dept.projects} active projects • {formatCurrency(dept.budget)} budget
                        </div>
                      </div>
                      <Badge 
                        variant={dept.performance >= 90 ? 'default' : dept.performance >= 80 ? 'secondary' : 'outline'}
                        className={dept.performance >= 90 ? 'bg-green-600' : ''}
                      >
                        {dept.performance}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-ryd h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${dept.performance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}