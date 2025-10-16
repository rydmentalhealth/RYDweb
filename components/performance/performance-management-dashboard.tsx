'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Target, Award, Users, Star, Plus, CheckCircle, Trophy, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

export function PerformanceManagementDashboard() {
  const { data: session } = useSession()
  const [kpis, setKpis] = useState<any[]>([])
  const [rewards, setRewards] = useState<any>({ rewards: [], totalPoints: 0, totalBadges: 0 })
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isKpiDialogOpen, setIsKpiDialogOpen] = useState(false)
  const [kpiFormData, setKpiFormData] = useState({
    title: '',
    description: '',
    target: '',
    category: 'TASK_COMPLETION',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [kpisRes, rewardsRes, badgesRes] = await Promise.all([
        fetch('/api/performance/kpis'),
        fetch('/api/performance/rewards?type=user-rewards'),
        fetch('/api/performance/rewards?type=badges'),
      ])
      
      if (kpisRes.ok) {
        const data = await kpisRes.json()
        setKpis(data.kpis || [])
      }
      
      if (rewardsRes.ok) {
        const data = await rewardsRes.json()
        setRewards(data)
      }
      
      if (badgesRes.ok) {
        const data = await badgesRes.json()
        setBadges(data.badges || [])
      }
    } catch (error) {
      toast.error('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const handleKpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Get employee profile
      const userRes = await fetch('/api/employees?limit=1')
      const userData = await userRes.json()
      const employee = userData.employees?.find((emp: any) => emp.userId === session?.user?.id)
      
      if (!employee) {
        toast.error('Employee profile not found')
        return
      }

      const response = await fetch('/api/performance/kpis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          ...kpiFormData,
          target: parseFloat(kpiFormData.target),
        }),
      })

      if (!response.ok) throw new Error('Failed to create KPI')

      toast.success('KPI created successfully! 🎯')
      setIsKpiDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create KPI')
    }
  }

  const completedKpis = kpis.filter(k => k.status === 'COMPLETED').length
  const avgProgress = kpis.length > 0 ? kpis.reduce((sum, k) => sum + k.progress, 0) / kpis.length : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Performance & Evaluation
          </h1>
          <p className="text-muted-foreground mt-1">
            Track KPIs, manage reviews, and celebrate achievements
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.length}</div>
            <p className="text-xs text-muted-foreground">{completedKpis} completed</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress.toFixed(0)}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.totalPoints}</div>
            <p className="text-xs text-muted-foreground">Recognition points</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rewards.totalBadges}</div>
            <p className="text-xs text-muted-foreground">Achievements unlocked</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kpis" className="gap-2">
            <Target className="h-4 w-4" />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Award className="h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Track your goals and performance metrics</CardDescription>
                </div>
                <Dialog open={isKpiDialogOpen} onOpenChange={setIsKpiDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add KPI
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create KPI</DialogTitle>
                      <DialogDescription>Set a new performance goal</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleKpiSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={kpiFormData.title} onChange={(e) => setKpiFormData({ ...kpiFormData, title: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={kpiFormData.description} onChange={(e) => setKpiFormData({ ...kpiFormData, description: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Target</Label>
                          <Input type="number" value={kpiFormData.target} onChange={(e) => setKpiFormData({ ...kpiFormData, target: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={kpiFormData.category} onValueChange={(v) => setKpiFormData({ ...kpiFormData, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TASK_COMPLETION">Task Completion</SelectItem>
                              <SelectItem value="PROJECT_DELIVERY">Project Delivery</SelectItem>
                              <SelectItem value="QUALITY">Quality</SelectItem>
                              <SelectItem value="INNOVATION">Innovation</SelectItem>
                              <SelectItem value="TEAMWORK">Teamwork</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" value={kpiFormData.startDate} onChange={(e) => setKpiFormData({ ...kpiFormData, startDate: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input type="date" value={kpiFormData.endDate} onChange={(e) => setKpiFormData({ ...kpiFormData, endDate: e.target.value })} required />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsKpiDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Create KPI</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.map((kpi) => (
                  <Card key={kpi.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{kpi.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{kpi.description}</p>
                          </div>
                          <Badge variant={kpi.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {kpi.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress: {kpi.current} / {kpi.target} {kpi.unit}</span>
                            <span className="font-medium">{kpi.progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={kpi.progress} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{kpi.category}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {kpis.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No KPIs yet</p>
                    <p className="text-sm">Create your first performance goal</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>360° Reviews</CardTitle>
              <CardDescription>Peer and supervisor feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">360° Review System</p>
                <p className="text-sm">Comprehensive feedback from peers, supervisors, and self-evaluation</p>
                <Button className="mt-4">Start Review Process</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Rewards & Recognition
              </CardTitle>
              <CardDescription>
                You've earned {rewards.totalBadges} badges and {rewards.totalPoints} points!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rewards.rewards.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {rewards.rewards.map((reward: any) => (
                    <Card key={reward.id} className="text-center">
                      <CardContent className="pt-6">
                        <div className="text-4xl mb-2">{reward.badge.icon || '🏆'}</div>
                        <h4 className="font-semibold">{reward.badge.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{reward.badge.description}</p>
                        <Badge className="mt-2">{reward.badge.points} points</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No badges yet</p>
                  <p className="text-sm">Keep up the great work to earn recognition!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
