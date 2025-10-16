'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Zap, 
  BarChart3, 
  PieChart, 
  DollarSign,
  Calendar,
  Users,
  Building2,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Download,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp as TrendingUpIcon
} from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { toast } from 'sonner'
import { usePermissions } from '@/lib/hooks/usePermissions'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'

interface AIInsight {
  id: string
  type: 'PREDICTION' | 'ANOMALY' | 'RECOMMENDATION' | 'OPTIMIZATION' | 'ALERT'
  title: string
  description: string
  confidence: number
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category: 'BUDGET' | 'EXPENSE' | 'STIPEND' | 'CASH_FLOW' | 'EFFICIENCY'
  data?: any
  actionable: boolean
  createdAt: string
  status: 'NEW' | 'REVIEWED' | 'IMPLEMENTED' | 'DISMISSED'
}

interface PredictionModel {
  id: string
  name: string
  type: 'EXPENSE_FORECAST' | 'BUDGET_UTILIZATION' | 'CASH_FLOW' | 'ANOMALY_DETECTION'
  accuracy: number
  lastTrained: string
  isActive: boolean
  predictions: Array<{
    period: string
    predicted: number
    actual?: number
    confidence: number
  }>
}

interface SmartRecommendation {
  id: string
  title: string
  description: string
  potentialSavings: number
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH'
  priority: number
  category: string
  steps: string[]
  estimatedTimeframe: string
}

interface FinancialHealthScore {
  overall: number
  budgetManagement: number
  expenseControl: number
  cashFlow: number
  efficiency: number
  compliance: number
  trends: Array<{
    month: string
    score: number
  }>
}

export function AIFinancialInsights() {
  const permissions = usePermissions()
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [predictions, setPredictions] = useState<PredictionModel[]>([])
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
  const [healthScore, setHealthScore] = useState<FinancialHealthScore>({
    overall: 0,
    budgetManagement: 0,
    expenseControl: 0,
    cashFlow: 0,
    efficiency: 0,
    compliance: 0,
    trends: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('insights')
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    type: 'user' | 'ai'
    content: string
    timestamp: string
  }>>([])
  const [chatInput, setChatInput] = useState('')

  useEffect(() => {
    if (permissions.hasPermission('VIEW_FINANCIAL_REPORTS')) {
      fetchAIInsights()
      fetchPredictions()
      fetchRecommendations()
      fetchHealthScore()
    }
  }, [permissions])

  const fetchAIInsights = async () => {
    try {
      const response = await fetch('/api/ai/insights')
      if (!response.ok) throw new Error('Failed to fetch AI insights')
      
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Error fetching AI insights:', error)
      toast.error('Failed to fetch AI insights')
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/ai/predictions')
      if (!response.ok) throw new Error('Failed to fetch predictions')
      
      const data = await response.json()
      setPredictions(data.predictions || [])
    } catch (error) {
      console.error('Error fetching predictions:', error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/ai/recommendations')
      if (!response.ok) throw new Error('Failed to fetch recommendations')
      
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const fetchHealthScore = async () => {
    try {
      const response = await fetch('/api/ai/health-score')
      if (!response.ok) throw new Error('Failed to fetch health score')
      
      const data = await response.json()
      setHealthScore(data)
    } catch (error) {
      console.error('Error fetching health score:', error)
    }
  }

  const runAIAnalysis = async () => {
    try {
      setIsAnalyzing(true)
      
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: 'COMPREHENSIVE',
          includeForecasting: true,
          includePredictions: true,
          includeRecommendations: true
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to run AI analysis')
      }

      toast.success('AI analysis completed successfully')
      
      // Refresh all data
      await Promise.all([
        fetchAIInsights(),
        fetchPredictions(),
        fetchRecommendations(),
        fetchHealthScore()
      ])
    } catch (error) {
      console.error('Error running AI analysis:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to run AI analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updateInsightStatus = async (insightId: string, status: string) => {
    try {
      const response = await fetch(`/api/ai/insights/${insightId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update insight status')

      toast.success('Insight status updated')
      fetchAIInsights()
    } catch (error) {
      console.error('Error updating insight status:', error)
      toast.error('Failed to update insight status')
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          context: 'financial_insights'
        }),
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: data.response,
        timestamp: new Date().toISOString()
      }

      setChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending chat message:', error)
      toast.error('Failed to get AI response')
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'PREDICTION': return <TrendingUp className="h-4 w-4" />
      case 'ANOMALY': return <AlertTriangle className="h-4 w-4" />
      case 'RECOMMENDATION': return <Lightbulb className="h-4 w-4" />
      case 'OPTIMIZATION': return <Target className="h-4 w-4" />
      case 'ALERT': return <Zap className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'PREDICTION': return 'bg-blue-100 text-blue-800'
      case 'ANOMALY': return 'bg-red-100 text-red-800'
      case 'RECOMMENDATION': return 'bg-green-100 text-green-800'
      case 'OPTIMIZATION': return 'bg-purple-100 text-purple-800'
      case 'ALERT': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'CRITICAL': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`
  }

  if (!permissions.hasPermission('VIEW_FINANCIAL_REPORTS')) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You don't have permission to view AI financial insights. Contact your administrator for access.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span>AI Financial Insights</span>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground">
            Advanced AI-powered financial analysis, predictions, and smart recommendations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure AI
          </Button>
          <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Financial Health Score</span>
          </CardTitle>
          <CardDescription>
            AI-powered assessment of your organization's financial health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getHealthScoreColor(healthScore.overall)}`}>
                {healthScore.overall}
              </div>
              <div className="text-sm text-muted-foreground">Overall</div>
              <Progress value={healthScore.overall} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.budgetManagement)}`}>
                {healthScore.budgetManagement}
              </div>
              <div className="text-sm text-muted-foreground">Budget</div>
              <Progress value={healthScore.budgetManagement} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.expenseControl)}`}>
                {healthScore.expenseControl}
              </div>
              <div className="text-sm text-muted-foreground">Expenses</div>
              <Progress value={healthScore.expenseControl} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.cashFlow)}`}>
                {healthScore.cashFlow}
              </div>
              <div className="text-sm text-muted-foreground">Cash Flow</div>
              <Progress value={healthScore.cashFlow} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.efficiency)}`}>
                {healthScore.efficiency}
              </div>
              <div className="text-sm text-muted-foreground">Efficiency</div>
              <Progress value={healthScore.efficiency} className="mt-2 h-2" />
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthScoreColor(healthScore.compliance)}`}>
                {healthScore.compliance}
              </div>
              <div className="text-sm text-muted-foreground">Compliance</div>
              <Progress value={healthScore.compliance} className="mt-2 h-2" />
            </div>
          </div>
          
          {healthScore.trends.length > 0 && (
            <div className="mt-6">
              <Label className="text-sm font-medium">Health Score Trend</Label>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={healthScore.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main AI Insights Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="models">ML Models</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="mt-6 space-y-6">
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading AI insights...</p>
                </CardContent>
              </Card>
            ) : insights.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No AI insights available. Run an analysis to generate insights.</p>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getInsightColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getInsightColor(insight.type)}>
                              {insight.type}
                            </Badge>
                            <Badge className={getImpactColor(insight.impact)}>
                              {insight.impact} Impact
                            </Badge>
                            <Badge variant="outline">
                              {insight.confidence}% Confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInsight(insight)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {insight.status === 'NEW' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateInsightStatus(insight.id, 'IMPLEMENTED')}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateInsightStatus(insight.id, 'DISMISSED')}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{insight.description}</p>
                    
                    {insight.actionable && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <ArrowRight className="h-4 w-4" />
                        <span>This insight has actionable recommendations</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                      <span>Category: {insight.category}</span>
                      <span>{format(new Date(insight.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6 space-y-6">
          {predictions.map((model) => (
            <Card key={model.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{model.name}</CardTitle>
                    <CardDescription>
                      Model accuracy: {model.accuracy}% • Last trained: {format(new Date(model.lastTrained), 'MMM dd, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge className={model.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {model.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {model.predictions.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={model.predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="predicted" 
                        stroke="#2563eb" 
                        strokeDasharray="5 5"
                        name="Predicted"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#16a34a" 
                        name="Actual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6 space-y-6">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <span>{rec.title}</span>
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-green-100 text-green-800">
                          {formatCurrency(rec.potentialSavings)} Savings
                        </Badge>
                        <Badge variant="outline">
                          {rec.implementationEffort} Effort
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          Priority {rec.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{rec.description}</p>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Implementation Steps:</Label>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {rec.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>Category: {rec.category}</span>
                    <span>Timeframe: {rec.estimatedTimeframe}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>AI Financial Assistant</span>
              </CardTitle>
              <CardDescription>
                Ask questions about your financial data and get AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                    <p>Start a conversation with your AI financial assistant</p>
                    <p className="text-sm mt-2">Try asking: "What are my biggest expense categories?" or "Predict next month's budget utilization"</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {format(new Date(message.timestamp), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about your financial data..."
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                />
                <Button onClick={sendChatMessage} disabled={!chatInput.trim()}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Models</CardTitle>
              <CardDescription>
                AI models powering financial predictions and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((model) => (
                  <div key={model.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{model.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Type: {model.type.replace(/_/g, ' ')} • Accuracy: {model.accuracy}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={model.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {model.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insight Details Dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedInsight && getInsightIcon(selectedInsight.type)}
              <span>{selectedInsight?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Detailed analysis and recommendations
            </DialogDescription>
          </DialogHeader>
          
          {selectedInsight && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Badge className={getInsightColor(selectedInsight.type)}>
                  {selectedInsight.type}
                </Badge>
                <Badge className={getImpactColor(selectedInsight.impact)}>
                  {selectedInsight.impact} Impact
                </Badge>
                <Badge variant="outline">
                  {selectedInsight.confidence}% Confidence
                </Badge>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedInsight.description}</p>
              </div>
              
              {selectedInsight.data && (
                <div>
                  <Label className="text-sm font-medium">Supporting Data</Label>
                  <pre className="text-xs bg-gray-50 p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedInsight.data, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedInsight(null)}>
                  Close
                </Button>
                {selectedInsight.actionable && (
                  <Button onClick={() => updateInsightStatus(selectedInsight.id, 'IMPLEMENTED')}>
                    Mark as Implemented
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}