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
  Download, 
  Mail, 
  Edit, 
  MoreHorizontal,
  Calendar,
  MapPin,
  Phone,
  Mail as MailIcon,
  Building2,
  User,
  Clock,
  FileText,
  Award,
  Users,
  Star,
  Heart
} from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  employmentType: string;
  startDate: string;
  status: string;
  profilePhoto?: string;
  bio?: string;
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
  };
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
      name: string;
    };
  }>;
  leaveRequests: Array<{
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
    reason?: string;
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
      name: string;
    };
  }>;
  welcomeNotes: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    documents: number;
    performanceReviews: number;
    leaveRequests: number;
    subordinates: number;
  };
}

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
    case 'CONTRACT': return 'bg-orange-100 text-orange-800';
    case 'VOLUNTEER': return 'bg-green-100 text-green-800';
    case 'INTERN': return 'bg-pink-100 text-pink-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM dd, yyyy');
};

const calculateAge = (dateOfBirth: string) => {
  return differenceInYears(new Date(), new Date(dateOfBirth));
};

const calculateTenure = (startDate: string) => {
  const months = differenceInMonths(new Date(), new Date(startDate));
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0) {
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
  }
  return `${months}m`;
};

export default function EmployeeProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Check if user has permission to view employees
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'HR_OFFICER', 'DIRECTOR', 'TEAM_LEAD'];
    if (!allowedRoles.includes(session.user.role)) {
      router.push('/unauthorized');
      return;
    }

    fetchEmployee();
  }, [session, status, employeeId, router]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee');
      }
      const data = await response.json();
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Employee Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The employee you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push('/employees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/employees')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{employee.fullName}</h1>
            <p className="text-muted-foreground">{employee.employeeId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Assign Task</DropdownMenuItem>
              <DropdownMenuItem>Schedule Meeting</DropdownMenuItem>
              <DropdownMenuItem>View Activity Log</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={employee.profilePhoto} />
              <AvatarFallback className="text-lg">
                {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">{employee.fullName}</h2>
                <Badge className={getStatusColor(employee.status)}>
                  {employee.status}
                </Badge>
                <Badge className={getEmploymentTypeColor(employee.employmentType)}>
                  {employee.employmentType.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.department || 'No department'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.designation || 'No designation'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Started {formatDate(employee.startDate)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Tenure: {calculateTenure(employee.startDate)}</span>
                  </div>
                  {employee.dateOfBirth && (
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Age: {calculateAge(employee.dateOfBirth)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee._count.subordinates} team members</span>
                  </div>
                </div>
              </div>
              
              {employee.bio && (
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">{employee.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{employee._count.documents}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{employee._count.performanceReviews}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{employee._count.leaveRequests}</p>
                <p className="text-xs text-muted-foreground">Leave Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{employee._count.subordinates}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gender</p>
                    <p className="text-sm">{employee.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-sm">{employee.dateOfBirth ? formatDate(employee.dateOfBirth) : 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">National ID</p>
                  <p className="text-sm">{employee.nationalId || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{employee.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{employee.email || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-sm">{employee.address || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-sm">{employee.department || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Designation</p>
                  <p className="text-sm">{employee.designation || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                  <p className="text-sm">
                    {employee.supervisor ? 
                      `${employee.supervisor.fullName} (${employee.supervisor.employeeId})` : 
                      'No supervisor assigned'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                  <p className="text-sm">{employee.employmentType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-sm">{formatDate(employee.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status}
                  </Badge>
                </div>
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
                    <div key={subordinate.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {subordinate.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{subordinate.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {subordinate.designation || 'No designation'} • {subordinate.employeeId}
                        </p>
                      </div>
                      <Badge className={getStatusColor(subordinate.status)}>
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
                    <div key={note.id} className="p-3 bg-blue-50 rounded-lg">
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
                {employee.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{document.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {document.category} • {formatDate(document.createdAt)}
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
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {review.reviewer.name} • {formatDate(review.reviewDate)}
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
                {employee.leaveRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{request.type}</h4>
                      <Badge
                        className={
                          request.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                    {request.reason && (
                      <p className="text-sm mt-2">{request.reason}</p>
                    )}
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
              <CardDescription>Employee attendance tracking</CardDescription>
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