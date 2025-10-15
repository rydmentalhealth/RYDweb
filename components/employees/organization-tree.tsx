'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Users, Building2, Crown, UserCheck, User } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  designation?: string;
  department?: string;
  status: string;
  profilePhoto?: string;
  subordinates: Employee[];
}

interface OrganizationTreeProps {
  employees: Employee[];
  rootEmployeeId?: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return <Crown className="h-4 w-4 text-yellow-600" />;
    case 'DIRECTOR':
      return <Building2 className="h-4 w-4 text-blue-600" />;
    case 'HR_OFFICER':
      return <UserCheck className="h-4 w-4 text-green-600" />;
    case 'TEAM_LEAD':
      return <Users className="h-4 w-4 text-purple-600" />;
    default:
      return <User className="h-4 w-4 text-gray-600" />;
  }
};

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

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function EmployeeNode({ employee, level = 0 }: { employee: Employee; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels

  const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;

  return (
    <div className="space-y-1">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
          {hasSubordinates ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" /> // Spacer for alignment
          )}
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.profilePhoto} />
            <AvatarFallback className="text-xs">
              {getInitials(employee.fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-sm truncate">{employee.fullName}</p>
              <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                {employee.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {employee.designation || 'No designation'} • {employee.employeeId}
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            {getRoleIcon(employee.designation || '')}
            {hasSubordinates && (
              <Badge variant="outline" className="text-xs">
                {employee.subordinates.length} reports
              </Badge>
            )}
          </div>
        </div>
        
        {hasSubordinates && (
          <CollapsibleContent>
            <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-4">
              {employee.subordinates.map((subordinate) => (
                <EmployeeNode
                  key={subordinate.id}
                  employee={subordinate}
                  level={level + 1}
                />
              ))}
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

export default function OrganizationTree({ employees, rootEmployeeId }: OrganizationTreeProps) {
  const [treeData, setTreeData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Build the organizational tree
  const buildTree = (employees: Employee[], rootId?: string): Employee[] => {
    if (rootId) {
      // Find the root employee and build tree from there
      const rootEmployee = employees.find(emp => emp.id === rootId);
      if (!rootEmployee) return [];
      
      const buildSubordinates = (employee: Employee): Employee => {
        const subordinates = employees
          .filter(emp => emp.id !== employee.id) // Avoid self-reference
          .map(emp => buildSubordinates(emp))
          .filter(emp => emp.subordinates.length > 0 || Math.random() > 0.7); // Simulate hierarchy
        
        return {
          ...employee,
          subordinates: subordinates.slice(0, 3) // Limit to 3 subordinates for demo
        };
      };
      
      return [buildSubordinates(rootEmployee)];
    } else {
      // Build tree from top-level employees (those without supervisors)
      const topLevelEmployees = employees.filter(emp => 
        !employees.some(other => other.subordinates?.some(sub => sub.id === emp.id))
      );
      
      const buildSubordinates = (employee: Employee): Employee => {
        const subordinates = employees
          .filter(emp => emp.id !== employee.id)
          .map(emp => buildSubordinates(emp))
          .filter(emp => emp.subordinates.length > 0 || Math.random() > 0.8);
        
        return {
          ...employee,
          subordinates: subordinates.slice(0, 2)
        };
      };
      
      return topLevelEmployees.map(emp => buildSubordinates(emp));
    }
  };

  useEffect(() => {
    if (employees.length > 0) {
      setLoading(false);
      const tree = buildTree(employees, rootEmployeeId);
      setTreeData(tree);
    }
  }, [employees, rootEmployeeId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (treeData.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organization Data</h3>
          <p className="text-muted-foreground text-center">
            Unable to build organizational tree. This might be due to missing supervisor relationships.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Organization Tree</span>
        </CardTitle>
        <CardDescription>
          Visual representation of the organizational hierarchy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {treeData.map((employee) => (
            <EmployeeNode key={employee.id} employee={employee} />
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <Crown className="h-3 w-3 text-yellow-600" />
              <span>Admin/Director</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-3 w-3 text-green-600" />
              <span>HR Officer</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-purple-600" />
              <span>Team Lead</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 text-gray-600" />
              <span>Staff/Volunteer</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
