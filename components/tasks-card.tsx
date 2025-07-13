import { Task } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageSquare, Paperclip, Clock, AlertCircle, Users, Shield } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
  URGENT: "bg-red-100 text-red-800",
} as const;

const statusColors = {
  NOT_STARTED: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800", 
  COMPLETED: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
} as const;

export function TaskCard({ task }: TaskCardProps) {
  // Check if task is overdue
  const isOverdue = 
    ((task.startDate && isPast(parseISO(task.startDate))) ||
     (task.endDate && isPast(parseISO(task.endDate)))) && 
    task.status !== 'COMPLETED'
  
  const displayStatus = isOverdue ? 'OVERDUE' : task.status
  
  // Calculate progress based on status
  const getProgress = () => {
    switch (task.status) {
      case 'NOT_STARTED': return 0
      case 'IN_PROGRESS': return 50
      case 'COMPLETED': return 100
      default: return 0
    }
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg line-clamp-2">{task.title}</h3>
          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
            {task.priority}
          </Badge>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {task.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {task.assignees.length === 1 ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignees[0].avatar || ""} />
                  <AvatarFallback className="text-xs">
                    {task.assignees[0].firstName?.[0]}{task.assignees[0].lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {task.assignees[0].firstName} {task.assignees[0].lastName}
                </span>
              </>
            ) : (
              <>
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={assignee.avatar || ""} />
                      <AvatarFallback className="text-xs">
                        {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {task.assignees.length} individual{task.assignees.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        )}

        {/* Team Assignments */}
        {task.teams && task.teams.length > 0 && (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {task.teams.map((team) => (
                <Badge 
                  key={team.id} 
                  variant="outline" 
                  className="text-xs"
                  style={{ backgroundColor: team.color || '#f3f4f6', color: '#374151' }}
                >
                  {team.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Progress</span>
            <Badge variant="outline" className={statusColors[displayStatus as keyof typeof statusColors]}>
              {displayStatus.replace('_', ' ')}
            </Badge>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Dates and Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {isOverdue ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Calendar className="h-4 w-4" />
            )}
            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
              {task.endDate ? format(parseISO(task.endDate), "MMM d") : "No due date"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>0</span> {/* Comments count - would need separate API call */}
            </div>
            <div className="flex items-center gap-1">
              <Paperclip className="h-4 w-4" />
              <span>0</span> {/* Attachments count - would need separate API call */}
            </div>
          </div>
        </div>
        
        {/* Project */}
        {task.project && (
          <div className="text-xs text-muted-foreground">
            Project: {task.project.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 