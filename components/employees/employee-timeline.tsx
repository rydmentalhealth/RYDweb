'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  UserPlus, 
  Award, 
  Building2, 
  FileText, 
  Clock, 
  Star,
  TrendingUp,
  UserMinus,
  GraduationCap,
  Heart,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
  id: string;
  type: 'JOINED' | 'PROMOTION' | 'ROLE_CHANGE' | 'DEPARTMENT_CHANGE' | 'RECOGNITION' | 'TRAINING' | 'LEAVE' | 'RETURN' | 'TERMINATION' | 'OTHER';
  title: string;
  description?: string;
  date: string;
  createdAt: string;
  metadata?: any;
}

interface EmployeeTimelineProps {
  employeeId: string;
  events?: TimelineEvent[];
}

const eventIcons = {
  JOINED: <UserPlus className="h-4 w-4" />,
  PROMOTION: <TrendingUp className="h-4 w-4" />,
  ROLE_CHANGE: <Building2 className="h-4 w-4" />,
  DEPARTMENT_CHANGE: <Building2 className="h-4 w-4" />,
  RECOGNITION: <Award className="h-4 w-4" />,
  TRAINING: <GraduationCap className="h-4 w-4" />,
  LEAVE: <Clock className="h-4 w-4" />,
  RETURN: <UserPlus className="h-4 w-4" />,
  TERMINATION: <UserMinus className="h-4 w-4" />,
  OTHER: <FileText className="h-4 w-4" />,
};

const eventColors = {
  JOINED: 'bg-green-100 text-green-800',
  PROMOTION: 'bg-blue-100 text-blue-800',
  ROLE_CHANGE: 'bg-purple-100 text-purple-800',
  DEPARTMENT_CHANGE: 'bg-indigo-100 text-indigo-800',
  RECOGNITION: 'bg-yellow-100 text-yellow-800',
  TRAINING: 'bg-cyan-100 text-cyan-800',
  LEAVE: 'bg-orange-100 text-orange-800',
  RETURN: 'bg-green-100 text-green-800',
  TERMINATION: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const eventDescriptions = {
  JOINED: 'Joined the organization',
  PROMOTION: 'Received a promotion',
  ROLE_CHANGE: 'Role changed',
  DEPARTMENT_CHANGE: 'Department changed',
  RECOGNITION: 'Received recognition',
  TRAINING: 'Completed training',
  LEAVE: 'Went on leave',
  RETURN: 'Returned from leave',
  TERMINATION: 'Left the organization',
  OTHER: 'Other event',
};

export default function EmployeeTimeline({ employeeId, events = [] }: EmployeeTimelineProps) {
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(events);
  const [loading, setLoading] = useState(!events.length);

  useEffect(() => {
    if (!events.length && employeeId) {
      // In a real app, you would fetch events from the API
      // For now, we'll generate some sample events
      generateSampleEvents();
    }
  }, [employeeId, events.length]);

  const generateSampleEvents = () => {
    const now = new Date();
    const sampleEvents: TimelineEvent[] = [
      {
        id: '1',
        type: 'JOINED',
        title: 'Joined RYD',
        description: 'Started as a volunteer',
        date: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
        createdAt: new Date().toISOString(),
        metadata: { position: 'Volunteer', department: 'Mental Health' }
      },
      {
        id: '2',
        type: 'TRAINING',
        title: 'Completed Mental Health Training',
        description: 'Completed comprehensive mental health awareness training',
        date: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000).toISOString(), // 300 days ago
        createdAt: new Date().toISOString(),
        metadata: { certification: 'Mental Health First Aid' }
      },
      {
        id: '3',
        type: 'PROMOTION',
        title: 'Promoted to Team Lead',
        description: 'Promoted to lead the mental health outreach team',
        date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
        createdAt: new Date().toISOString(),
        metadata: { newPosition: 'Team Lead', previousPosition: 'Volunteer' }
      },
      {
        id: '4',
        type: 'RECOGNITION',
        title: 'Employee of the Month',
        description: 'Recognized for outstanding contribution to mental health initiatives',
        date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
        createdAt: new Date().toISOString(),
        metadata: { award: 'Employee of the Month', month: 'October' }
      },
      {
        id: '5',
        type: 'TRAINING',
        title: 'Leadership Development Program',
        description: 'Completed advanced leadership and management training',
        date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
        createdAt: new Date().toISOString(),
        metadata: { program: 'Leadership Development', duration: '2 weeks' }
      }
    ];

    setTimelineEvents(sampleEvents);
    setLoading(false);
  };

  const formatEventDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getRelativeTime = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - eventDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Timeline Events</h3>
          <p className="text-muted-foreground text-center">
            No events have been recorded for this employee yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Employee Timeline</span>
        </CardTitle>
        <CardDescription>
          Key events and milestones in the employee's journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {timelineEvents
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((event, index) => (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                    eventColors[event.type]
                  }`}>
                    {eventIcons[event.type]}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge className={`text-xs ${eventColors[event.type]}`}>
                        {event.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    )}
                    
                    {/* Event metadata */}
                    {event.metadata && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-1">
                            <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-muted-foreground">
                        {getRelativeTime(event.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        {/* Timeline summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Events:</span>
              <span className="ml-2 font-medium">{timelineEvents.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Latest Event:</span>
              <span className="ml-2 font-medium">
                {timelineEvents.length > 0 
                  ? getRelativeTime(timelineEvents[0].date)
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
