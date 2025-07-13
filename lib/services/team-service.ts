/**
 * Team Management Service
 * Contains functions for team management and team membership operations
 */

import { prisma } from "@/lib/db"
import { TeamRole, UserStatus } from "@/lib/generated/prisma"

// Team interfaces
export interface Team {
  id: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  members?: UserTeam[]
  tasks?: TaskTeam[]
  _count?: {
    members: number
    tasks: number
  }
}

export interface UserTeam {
  id: string
  userId: string
  teamId: string
  role: TeamRole
  joinedAt: Date
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar?: string | null
    status: string
    role: string
  }
}

export interface TaskTeam {
  id: string
  taskId: string
  teamId: string
  assignedAt: Date
  task?: {
    id: string
    title: string
    status: string
    priority: string
    startDate?: Date | null
    endDate?: Date | null
  }
}

export interface CreateTeamData {
  name: string
  description?: string
  color?: string
  icon?: string
  isActive?: boolean
}

export interface UpdateTeamData extends Partial<CreateTeamData> {}

export interface AddTeamMemberData {
  userId: string
  teamId: string
  role?: TeamRole
}

// Team Management Functions

export async function getAllTeams(options?: {
  includeMembers?: boolean
  includeTasks?: boolean
  activeOnly?: boolean
}): Promise<Team[]> {
  const include: any = {}
  
  if (options?.includeMembers) {
    include.members = {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            status: true,
            role: true
          }
        }
      }
    }
  }
  
  if (options?.includeTasks) {
    include.tasks = {
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true
          }
        }
      }
    }
  }
  
  include._count = {
    select: {
      members: true,
      tasks: true
    }
  }

  const teams = await prisma.team.findMany({
    where: options?.activeOnly ? { isActive: true } : undefined,
    include,
    orderBy: { name: 'asc' }
  })

  return teams
}

export async function getTeamById(
  id: string,
  options?: {
    includeMembers?: boolean
    includeTasks?: boolean
  }
): Promise<Team | null> {
  const include: any = {}
  
  if (options?.includeMembers) {
    include.members = {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            status: true,
            role: true
          }
        }
      }
    }
  }
  
  if (options?.includeTasks) {
    include.tasks = {
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            startDate: true,
            endDate: true
          }
        }
      }
    }
  }
  
  include._count = {
    select: {
      members: true,
      tasks: true
    }
  }

  const team = await prisma.team.findUnique({
    where: { id },
    include
  })

  return team
}

export async function createTeam(data: CreateTeamData): Promise<Team> {
  const team = await prisma.team.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      isActive: data.isActive ?? true
    },
    include: {
      _count: {
        select: {
          members: true,
          tasks: true
        }
      }
    }
  })

  return team
}

export async function updateTeam(id: string, data: UpdateTeamData): Promise<Team> {
  const team = await prisma.team.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    },
    include: {
      _count: {
        select: {
          members: true,
          tasks: true
        }
      }
    }
  })

  return team
}

export async function deleteTeam(id: string): Promise<void> {
  // First check if team exists
  const existingTeam = await prisma.team.findUnique({
    where: { id }
  })

  if (!existingTeam) {
    throw new Error("Team not found")
  }

  // Delete team (cascade will handle related records)
  await prisma.team.delete({
    where: { id }
  })
}

// Team Membership Functions

export async function addTeamMember(data: AddTeamMemberData): Promise<UserTeam> {
  // Check if user exists and is active
  const user = await prisma.user.findUnique({
    where: { id: data.userId }
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.status !== 'ACTIVE') {
    throw new Error(`Cannot add user to team: User is ${user.status.toLowerCase()}`)
  }

  // Check if team exists
  const team = await prisma.team.findUnique({
    where: { id: data.teamId }
  })

  if (!team) {
    throw new Error("Team not found")
  }

  // Check if membership already exists
  const existingMembership = await prisma.userTeam.findUnique({
    where: {
      userId_teamId: {
        userId: data.userId,
        teamId: data.teamId
      }
    }
  })

  if (existingMembership) {
    throw new Error("User is already a member of this team")
  }

  // Create membership
  const membership = await prisma.userTeam.create({
    data: {
      userId: data.userId,
      teamId: data.teamId,
      role: data.role || TeamRole.MEMBER
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          status: true,
          role: true
        }
      }
    }
  })

  return membership
}

export async function removeTeamMember(userId: string, teamId: string): Promise<void> {
  // Check if membership exists
  const membership = await prisma.userTeam.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId
      }
    }
  })

  if (!membership) {
    throw new Error("User is not a member of this team")
  }

  // Remove membership
  await prisma.userTeam.delete({
    where: {
      userId_teamId: {
        userId,
        teamId
      }
    }
  })
}

export async function getUserTeams(userId: string): Promise<UserTeam[]> {
  const memberships = await prisma.userTeam.findMany({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          isActive: true
        }
      }
    },
    orderBy: {
      team: {
        name: 'asc'
      }
    }
  })

  return memberships.map(membership => ({
    ...membership,
    team: membership.team
  })) as any
}

// Legacy Team Member functions for backward compatibility
export interface TeamMember {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  role: string;
  status: string;
  district?: string | null;
  region?: string | null;
  availability?: string | null;
  languages?: string | null;
  skills?: string | null;
  emergencyContact?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string | null;
}

export interface CreateTeamMemberData {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  nationalId?: string;
  role: string;
  status?: string;
  district?: string;
  region?: string;
  availability?: string;
  languages?: string;
  skills?: string;
  emergencyContact?: string;
  jobTitle?: string;
  department?: string;
}

export type UpdateTeamMemberData = Partial<CreateTeamMemberData>;

// Get all team members (users)
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const response = await fetch('/api/team', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch team members');
  }

  return response.json();
}

// Get a team member by ID
export async function getTeamMemberById(id: string): Promise<TeamMember> {
  const response = await fetch(`/api/team/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch team member');
  }

  return response.json();
}

// Create a new team member
export async function createTeamMember(data: CreateTeamMemberData): Promise<TeamMember> {
  const response = await fetch('/api/team', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create team member');
  }

  return response.json();
}

// Update a team member
export async function updateTeamMember(id: string, data: UpdateTeamMemberData): Promise<TeamMember> {
  const response = await fetch(`/api/team/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update team member');
  }

  return response.json();
}

// Delete a team member
export async function deleteTeamMember(id: string): Promise<void> {
  const response = await fetch(`/api/team/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete team member');
  }
} 