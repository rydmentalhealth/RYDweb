# Teams Management System Implementation

This document outlines the comprehensive Teams Management feature implementation for the RYD Mental Health platform.

## Overview

The Teams Management system introduces structured team organization with predefined teams, allowing volunteers to be assigned to multiple teams and enabling both team-level and individual task assignments.

## Predefined Teams

The system includes seven predefined organizational teams:

1. **Therapy** - Mental health therapy and counseling services
2. **Web and IT** - Website development, IT support, and digital infrastructure
3. **Events and Community Outreach** - Community events, outreach programs, and public engagement
4. **Marketing and PR** - Marketing campaigns, public relations, and brand management
5. **Writing and Content Creation** - Content writing, documentation, and editorial work
6. **Graphics and Media Production** - Graphic design, video production, and visual content creation
7. **Grants and Research** - Grant writing, research initiatives, and funding opportunities

## Database Schema Changes

### New Models Added to Prisma Schema

```prisma
model Team {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  // Hex color code for team branding
  icon        String?  // Icon name for team identification
  isActive    Boolean  @default(true)
  
  // Relations
  members     UserTeam[]   // Team memberships
  tasks       TeamTask[]   // Tasks assigned to this team
  
  // Audit
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("teams")
}

model UserTeam {
  id       String @id @default(cuid())
  userId   String
  teamId   String
  role     String @default("MEMBER") // LEADER, COORDINATOR, MEMBER
  joinedAt DateTime @default(now())
  
  // Relations
  user     User @relation(fields: [userId], references: [id], onDelete: Cascade)
  team     Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@unique([userId, teamId])
  @@map("user_teams")
}

model TeamTask {
  id         String   @id @default(cuid())
  taskId     String
  teamId     String
  assignedAt DateTime @default(now())
  
  // Relations
  task       Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  team       Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  
  @@unique([taskId, teamId])
  @@map("team_tasks")
}
```

### Updated User Model

```prisma
// Added to User model
teams UserTeam[] // New: User team memberships
```

### Updated Task Model

```prisma
// Added to Task model
teamAssignments TeamTask[] // New: Team assignments
```

## API Endpoints

### Teams Management

- `GET /api/teams` - Get all teams with optional filters
- `POST /api/teams` - Create a new team
- `GET /api/teams/[id]` - Get specific team details
- `PATCH /api/teams/[id]` - Update team information
- `DELETE /api/teams/[id]` - Delete a team

### Team Members Management

- `POST /api/teams/[id]/members` - Add a member to a team
- `DELETE /api/teams/[id]/members/[userId]` - Remove a member from a team

### User Teams

- `GET /api/users/[id]/teams` - Get teams for a specific user

## Service Layer

### Team Service (`lib/services/team-service.ts`)

Core functions for team operations:

- `getAllTeams()` - Retrieve all teams with optional includes
- `getTeamById()` - Get specific team with details
- `createTeam()` - Create new team
- `updateTeam()` - Update team information
- `deleteTeam()` - Remove team
- `addTeamMember()` - Add user to team
- `removeTeamMember()` - Remove user from team
- `getUserTeams()` - Get teams for specific user

## React Hooks

### Teams Hook (`lib/hooks/use-teams.ts`)

React Query hooks for team management:

- `useTeams()` - Fetch all teams
- `useTeam()` - Fetch specific team
- `useAddTeam()` - Create team mutation
- `useUpdateTeam()` - Update team mutation
- `useDeleteTeam()` - Delete team mutation
- `useAddTeamMember()` - Add member mutation
- `useRemoveTeamMember()` - Remove member mutation
- `useUserTeams()` - Fetch user's teams

## UI Components

### Teams Client (`components/teams/teams-client.tsx`)

Main teams management interface featuring:

- **Teams Grid Display** - Visual cards showing team information
- **Search and Filtering** - Find teams by name or description
- **Team Cards** - Color-coded with icons, member count, and task count
- **Team Actions** - Manage team settings and members
- **Member Previews** - Avatar display of team members

### Add Team Sheet (`components/teams/add-team-sheet.tsx`)

Team creation interface with:

- **Template Selection** - Quick setup using predefined teams
- **Custom Team Creation** - Manual team configuration
- **Visual Customization** - Icon and color selection
- **Form Validation** - Input validation and error handling

### Key Features

1. **Template-based Creation** - Toggle to use predefined team templates
2. **Visual Branding** - Custom colors and icons for team identity
3. **Status Management** - Active/inactive team status
4. **Form Validation** - Real-time validation with error feedback

## Team Assignment System

### Dual Assignment Support

The system supports both individual and team-based task assignments:

1. **Individual Assignments** - Direct user-to-task assignments (existing system)
2. **Team Assignments** - Team-to-task assignments (new feature)
3. **Mixed Assignments** - Tasks can have both individual assignees and team assignments

### Assignment Logic

- Tasks can be assigned to teams through the `TeamTask` junction table
- Individual team members inherit team assignments
- Users can have additional individual assignments beyond team assignments
- Task views show both individual and team assignment information

## Navigation Integration

### Dashboard Menu

Add to main navigation:

```typescript
{
  title: "Teams",
  href: "/dashboard/teams",
  icon: Users,
  description: "Manage organizational teams"
}
```

### Breadcrumb Support

- `/dashboard/teams` - Teams overview
- `/dashboard/teams/[id]` - Individual team management

## Security Considerations

### Access Control

- **Team Creation** - Restricted to ADMIN and SUPER_ADMIN roles
- **Team Management** - Team leaders can manage their teams
- **Member Assignment** - Admins and team leaders can assign members
- **Task Assignment** - Follows existing task assignment permissions

### Data Validation

- All API endpoints include Zod schema validation
- Form inputs are validated on both client and server
- Unique constraints prevent duplicate memberships
- Referential integrity maintained through foreign keys

## Usage Examples

### Creating a Predefined Team

```typescript
const createTherapyTeam = async () => {
  const team = await createTeam({
    name: "Therapy",
    description: "Mental health therapy and counseling services",
    color: "#10b981",
    icon: "Heart",
    isActive: true
  })
}
```

### Adding Members to Team

```typescript
const addVolunteerToTeam = async () => {
  await addTeamMember({
    userId: "user_123",
    teamId: "team_456",
    role: "MEMBER"
  })
}
```

### Assigning Task to Team

```typescript
// This would be implemented in the task assignment system
const assignTaskToTeam = async () => {
  await createTeamTask({
    taskId: "task_789",
    teamId: "team_456"
  })
}
```

## Migration Requirements

### Database Migration

1. Run Prisma migration to add new tables:
   ```bash
   npx prisma migrate dev --name add-teams-system
   ```

2. Generate updated Prisma client:
   ```bash
   npx prisma generate
   ```

3. Seed predefined teams (optional):
   ```bash
   npx prisma db seed
   ```

### Task System Integration

To fully integrate teams with the existing task system:

1. Update task creation forms to include team assignment options
2. Modify task display components to show team assignments
3. Update task filtering to include team-based filters
4. Add team task assignment logic to existing task services

## Performance Considerations

### Database Queries

- Include statements are used judiciously to avoid N+1 queries
- Pagination can be added for large team lists
- Indexes on foreign keys for optimal join performance

### Caching Strategy

- React Query provides client-side caching
- API responses include proper cache headers
- Team membership changes invalidate relevant queries

## Testing Strategy

### Unit Tests

- Service layer functions
- API endpoint validation
- React hook behavior
- Form validation logic

### Integration Tests

- Team creation workflow
- Member assignment process
- Task-team assignment integration
- Permission and access control

## Future Enhancements

### Potential Features

1. **Team Hierarchies** - Parent-child team relationships
2. **Team Templates** - Custom team templates beyond predefined ones
3. **Team Analytics** - Performance metrics and reporting
4. **Team Communications** - Integrated messaging system
5. **Team Goals** - Goal setting and tracking per team
6. **Team Calendar** - Shared team scheduling
7. **Team Documents** - Document sharing within teams

### Scalability Considerations

- Team role permissions system expansion
- Multi-tenant team support
- Team-based notification systems
- Advanced team reporting and analytics

## Conclusion

The Teams Management system provides a comprehensive foundation for organizing volunteers into structured teams while maintaining the flexibility of individual task assignments. The implementation follows best practices for scalability, security, and user experience, providing a solid base for future enhancements.

The system is designed to integrate seamlessly with the existing RYD Mental Health platform while adding powerful new organizational capabilities that will improve volunteer coordination and task management efficiency. 