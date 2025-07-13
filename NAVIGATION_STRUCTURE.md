# Navigation Structure Documentation

## Overview

The RYD Mental Health platform has two distinct sections for user and team management, each serving different purposes:

## 1. System Users (`/dashboard/team`)

**Purpose**: Individual user account management
**Icon**: Users2Icon (representing individual people)
**Navigation Label**: "System Users"

### What it manages:
- Individual user profiles and accounts
- User roles and permissions (SUPER_ADMIN, ADMIN, STAFF, VOLUNTEER)
- User status (PENDING, ACTIVE, INACTIVE, SUSPENDED, REJECTED)
- Personal information (contact details, skills, availability)
- User registration and approval workflow

### Key Features:
- Add new system users
- Edit user profiles
- Approve/reject pending users
- Change user roles and status
- View user statistics
- Export user data

### Target Users:
- Admins managing individual people
- HR staff handling user accounts
- Managers overseeing user permissions

## 2. Teams Management (`/dashboard/teams`)

**Purpose**: Organizational team structure and team membership management
**Icon**: UsersIcon (representing groups/teams)
**Navigation Label**: "Teams Management"

### What it manages:
- Organizational teams (Therapy, Web and IT, Events, Marketing, etc.)
- Team composition and member assignments
- Team roles within teams (LEADER, COORDINATOR, MEMBER)
- Team-level task assignments
- Team structure and hierarchy

### Key Features:
- Create and manage organizational teams
- Assign system users to teams with specific roles
- Remove users from teams
- Change team member roles (Leader, Coordinator, Member)
- View team statistics and composition
- Manage team-level tasks and projects

### Target Users:
- Admins organizing team structure
- Team leaders managing their teams
- Project managers assigning team responsibilities

## How They Work Together

### User Journey:
1. **System Users**: A person is first added as a system user with basic account details
2. **Teams Management**: The same person can then be assigned to one or more organizational teams
3. **Role Distinction**: 
   - System role (ADMIN, STAFF, VOLUNTEER) = platform permissions
   - Team role (LEADER, COORDINATOR, MEMBER) = responsibilities within specific teams

### Example Workflow:
```
1. Add "John Doe" as STAFF in System Users
   ↓
2. Assign "John Doe" to "Web and IT" team as LEADER
   ↓ 
3. Also assign "John Doe" to "Marketing" team as MEMBER
   ↓
4. John has STAFF permissions on the platform + leads IT team + helps with marketing
```

## Technical Implementation

### Database Structure:
- `User` model: Core user accounts and profiles
- `Team` model: Organizational teams
- `UserTeam` model: Many-to-many relationship with team roles

### API Endpoints:
- `/api/users/` - System user management
- `/api/teams/` - Team management
- `/api/teams/[id]/members/` - Team membership management

### Features:
- **Multi-team assignments**: Users can belong to multiple teams
- **Role hierarchy**: Team roles are independent of system roles
- **Dynamic assignment**: Users can be added/removed from teams anytime
- **Permission control**: Only admins and staff can manage team assignments

## User Experience Guidelines

### Clear Separation:
- Use distinct icons and labels to avoid confusion
- "System Users" focuses on individual people
- "Teams Management" focuses on group organization

### Consistent Flow:
- Users must exist in System Users before being assigned to teams
- Team assignments are optional and flexible
- Both sections maintain their own search, filtering, and management tools

### Access Control:
- System Users: Admin/Staff can manage all users
- Teams Management: Admin/Staff can manage team assignments
- Regular users see limited views based on their permissions

This structure provides maximum flexibility for volunteer coordination while maintaining clear boundaries between individual account management and organizational team structure. 