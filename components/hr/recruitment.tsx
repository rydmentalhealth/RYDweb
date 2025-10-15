'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react'

interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'VOLUNTEER'
  status: 'OPEN' | 'CLOSED' | 'PAUSED'
  applications: number
  postedDate: string
  salary?: string
  description: string
}

export function Recruitment() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobPostings()
  }, [])

  const fetchJobPostings = async () => {
    try {
      // Mock data - replace with actual API call
      const mockJobs: JobPosting[] = [
        {
          id: '1',
          title: 'Mental Health Therapist',
          department: 'Therapy',
          location: 'Kampala',
          type: 'FULL_TIME',
          status: 'OPEN',
          applications: 12,
          postedDate: '2024-01-10',
          salary: 'UGX 2,500,000 - 3,500,000',
          description: 'We are seeking a qualified mental health therapist to join our team...'
        },
        {
          id: '2',
          title: 'Community Outreach Coordinator',
          department: 'Outreach',
          location: 'Kampala',
          type: 'FULL_TIME',
          status: 'OPEN',
          applications: 8,
          postedDate: '2024-01-08',
          salary: 'UGX 2,000,000 - 2,800,000',
          description: 'Lead community outreach programs and mental health awareness campaigns...'
        },
        {
          id: '3',
          title: 'Finance Assistant',
          department: 'Finance',
          location: 'Kampala',
          type: 'PART_TIME',
          status: 'OPEN',
          applications: 5,
          postedDate: '2024-01-05',
          salary: 'UGX 1,500,000 - 2,000,000',
          description: 'Support financial operations and budget management...'
        },
        {
          id: '4',
          title: 'Volunteer Coordinator',
          department: 'Volunteer Management',
          location: 'Kampala',
          type: 'VOLUNTEER',
          status: 'CLOSED',
          applications: 15,
          postedDate: '2023-12-20',
          description: 'Coordinate volunteer activities and training programs...'
        }
      ]
      setJobPostings(mockJobs)
    } catch (error) {
      console.error('Error fetching job postings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      CLOSED: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      PAUSED: { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CLOSED
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      FULL_TIME: { color: 'bg-blue-100 text-blue-800' },
      PART_TIME: { color: 'bg-purple-100 text-purple-800' },
      CONTRACT: { color: 'bg-orange-100 text-orange-800' },
      VOLUNTEER: { color: 'bg-pink-100 text-pink-800' }
    }
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.FULL_TIME
    
    return (
      <Badge className={config.color}>
        {type.replace('_', ' ')}
      </Badge>
    )
  }

  const openJobs = jobPostings.filter(job => job.status === 'OPEN').length
  const totalApplications = jobPostings.reduce((sum, job) => sum + job.applications, 0)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading job postings...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Recruitment & Hiring</h2>
          <p className="text-muted-foreground">Manage job postings, applications, and hiring pipeline</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Postings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostings.length}</div>
            <p className="text-xs text-muted-foreground">Job postings</p>
          </CardContent>
        </Card>
      </div>

      {/* Job Postings */}
      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
          <CardDescription>
            Manage your organization's job postings and recruitment pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      {getStatusBadge(job.status)}
                      {getTypeBadge(job.type)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                      {job.salary && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {job.applications} applications
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          Applications
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {jobPostings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4" />
              <p>No job postings found</p>
              <p className="text-sm">Create your first job posting to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}