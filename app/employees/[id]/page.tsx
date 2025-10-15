'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Award, 
  Clock, 
  Users, 
  Download,
  Edit,
  MoreHorizontal,
  Send,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  nationalId?: string;
  phone?: string;
  email?: string;
  address?: string;
  department?: string;
  designation?: string;
  employmentType: string;
  status: string;
  profilePhoto?: string;
  bio?: string;
  startDate?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  };
  supervisor?: {
    id: string;
    fullName: string;
    employeeId: string;
    designation?: string;
    department?: string;
  };
  subordinates: Array<{
    id: string;
    fullName: string;
    employeeId: string;
    designation?: string;
    department?: string;
    status: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    category: string;
    fileType: string;
    createdAt: string;
  }>;
  performanceReviews: Array<{
    id: string;
    title: string;
    rating?: number;
    reviewDate: string;
    reviewer: {
      id: string;
      name?: string;
    };
  }>;
  leaveRequests: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
    createdAt: string;
  }>;
  timelineEvents: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    date: string;
    createdAt: string;
  }>;
  privateNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name?: string;
    };
  }>;
  welcomeNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name?: string;
    };
  }>;
  _count: {
    documents: number;
    performanceReviews: number;
    leaveRequests: number;
    subordinates: number;
  };
}

export default function EmployeeProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect if not authenticated or insufficient permissions
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'];
    if (!allowedRoles.includes(session.user.role)) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch employee data
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/employees');
          return;
        }
        throw new Error('Failed to fetch employee');
      }

      const data = await response.json();
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
      toast.error('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && employeeId) {
      fetchEmployee();
    }
  }, [session, employeeId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'TERMINATED': return 'bg-red-100 text-red-800';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'FULL_TIME': return 'bg-blue-100 text-blue-800';
      case 'PART_TIME': return 'bg-purple-100 text-purple-800';
      case 'CONTRACT': return 'bg-indigo-100 text-indigo-800';
      case 'VOLUNTEER': return 'bg-pink-100 text-pink-800';
      case 'INTERN': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateTenure = (startDate?: string) => {
    if (!startDate) return 'N/A';
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || !employee) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/employees')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.profilePhoto} />
              <AvatarFallback className="text-lg">
                {getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{employee.fullName}</h1>
                  <p className="text-lg text-muted-foreground">{employee.employeeId}</p>
                  <p className="text-muted-foreground">{employee.designation || 'No designation'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </Badge>
                  <Badge className={`${getEmploymentTypeColor(employee.employmentType)}`}>
                    {employee.employmentType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.department || 'No department'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined {formatDate(employee.startDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{calculateTenure(employee.startDate)} tenure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Age {calculateAge(employee.dateOfBirth)}</span>
                </div>
              </div>

              {employee.bio && (
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">{employee.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee._count.documents}</div>
            <p className="text-xs text-muted-foreground">Files uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Reviews</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee._count.performanceReviews}</div>
            <p className="text-xs text-muted-foreground">Reviews completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee._count.leaveRequests}</div>
            <p className="text-xs text-muted-foreground">Total requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee._count.subordinates}</div>
            <p className="text-xs text-muted-foreground">Direct reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.email || 'No email'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.address || 'No address'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.gender || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Born {formatDate(employee.dateOfBirth)}</span>
                </div>
                {employee.nationalId && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ID: {employee.nationalId}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.department || 'No department'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{employee.designation || 'No designation'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Started {formatDate(employee.startDate)}</span>
                </div>
                {employee.supervisor && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reports to {employee.supervisor.fullName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          {employee.subordinates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Direct reports under this employee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employee.subordinates.map((subordinate) => (
                    <div key={subordinate.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(subordinate.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{subordinate.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {subordinate.designation} • {subordinate.department}
                        </p>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(subordinate.status)}`}>
                        {subordinate.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Welcome Notes */}
          {employee.welcomeNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome Notes</CardTitle>
                <CardDescription>Messages from HR and management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employee.welcomeNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        By {note.author.name || 'Unknown'} • {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Employee documents and files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category} • {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
                {employee.documents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Employee performance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.performanceReviews.map((review) => (
                  <div key={review.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{review.title}</h4>
                      {review.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reviewed by {review.reviewer.name || 'Unknown'} • {formatDate(review.reviewDate)}
                    </p>
                  </div>
                ))}
                {employee.performanceReviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No performance reviews yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Employee leave history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.leaveRequests.map((leave) => (
                  <div key={leave.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{leave.type}</h4>
                      <Badge className={`text-xs ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)} • {formatDate(leave.createdAt)}
                    </p>
                  </div>
                ))}
                {employee.leaveRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No leave requests yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Employee attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Attendance tracking will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Private Notes</CardTitle>
              <CardDescription>Internal notes (visible to HR and management only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.privateNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      By {note.author.name || 'Unknown'} • {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
                {employee.privateNotes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No private notes yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
                {employee.documents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
              <CardDescription>Employee performance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.performanceReviews.map((review) => (
                  <div key={review.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{review.title}</h4>
                      {review.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Reviewed by {review.reviewer.name || 'Unknown'} • {formatDate(review.reviewDate)}
                    </p>
                  </div>
                ))}
                {employee.performanceReviews.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No performance reviews yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Employee leave history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.leaveRequests.map((leave) => (
                  <div key={leave.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{leave.type}</h4>
                      <Badge className={`text-xs ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)} • {formatDate(leave.createdAt)}
                    </p>
                  </div>
                ))}
                {employee.leaveRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No leave requests yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
              <CardDescription>Employee attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Attendance tracking will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Private Notes</CardTitle>
              <CardDescription>Internal notes (visible to HR and management only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employee.privateNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      By {note.author.name || 'Unknown'} • {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
                {employee.privateNotes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No private notes yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
