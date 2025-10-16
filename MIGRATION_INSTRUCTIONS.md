# Database Migration Instructions

## Overview

This guide will help you apply the new database schema changes for the enhanced HR modules.

## Prerequisites

- PostgreSQL database running
- `DATABASE_URL` environment variable configured
- Prisma CLI installed

## Migration Steps

### 1. Review Schema Changes

The following new models have been added:
- Enhanced `CheckIn` model with geolocation
- `DailyTaskLog` for task logging
- `WorkSummary` for monthly reports
- Enhanced `LeaveRequest` with more features
- `LeaveTypeConfig` for custom leave types
- `LeaveBalance` for tracking leave balances
- `AbsenceAlert` for absence monitoring
- `KPI` for performance goals
- `Review360` for 360-degree reviews
- `RewardBadge` and `UserReward` for recognition system

### 2. Generate Migration

```bash
npx prisma migrate dev --name add_enhanced_hr_modules
```

This will:
- Create a new migration file
- Apply the changes to your database
- Regenerate Prisma Client

### 3. Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

Browse the new tables to ensure they were created correctly.

### 4. Seed Default Data (Optional)

You may want to seed some default data:

```typescript
// Example: Create default leave types
await prisma.leaveTypeConfig.createMany({
  data: [
    {
      name: 'Annual Leave',
      code: 'ANNUAL',
      description: 'Regular annual leave',
      defaultDays: 21,
      color: '#3B82F6',
      requiresApproval: true,
    },
    {
      name: 'Sick Leave',
      code: 'SICK',
      description: 'Medical/health related leave',
      defaultDays: 15,
      color: '#EF4444',
      requiresDocument: true,
    },
    {
      name: 'Study Leave',
      code: 'STUDY',
      description: 'Educational purposes',
      defaultDays: 10,
      color: '#8B5CF6',
    },
  ],
})

// Example: Create default reward badges
await prisma.rewardBadge.createMany({
  data: [
    {
      name: 'Outstanding Volunteer',
      description: 'Exceptional volunteer contribution',
      icon: '🌟',
      color: '#FFD700',
      points: 100,
      category: 'EXCELLENCE',
    },
    {
      name: 'Best Collaborator',
      description: 'Excellent teamwork and collaboration',
      icon: '🤝',
      color: '#10B981',
      points: 75,
      category: 'TEAMWORK',
    },
    {
      name: 'Perfect Attendance',
      description: '100% attendance for the month',
      icon: '⭐',
      color: '#3B82F6',
      points: 50,
      category: 'ATTENDANCE',
    },
  ],
})
```

### 5. Initialize Leave Balances for Existing Employees

Run a script to create leave balances for all existing employees:

```typescript
const employees = await prisma.employeeProfile.findMany()
const currentYear = new Date().getFullYear()

for (const employee of employees) {
  await prisma.leaveBalance.createMany({
    data: [
      {
        employeeId: employee.id,
        leaveType: 'ANNUAL',
        year: currentYear,
        allocated: 21,
        used: 0,
        remaining: 21,
        carried: 0,
      },
      {
        employeeId: employee.id,
        leaveType: 'SICK',
        year: currentYear,
        allocated: 15,
        used: 0,
        remaining: 15,
        carried: 0,
      },
      {
        employeeId: employee.id,
        leaveType: 'STUDY',
        year: currentYear,
        allocated: 10,
        used: 0,
        remaining: 10,
        carried: 0,
      },
    ],
    skipDuplicates: true,
  })
}
```

## Rollback (If Needed)

If you need to rollback the migration:

```bash
npx prisma migrate resolve --rolled-back [migration-name]
```

## Production Deployment

For production deployment:

1. **Backup your database first!**
```bash
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. Apply migration in production:
```bash
npx prisma migrate deploy
```

3. Verify the deployment:
- Check all new tables exist
- Verify no data loss
- Test basic CRUD operations
- Check application functionality

## Testing Checklist

After migration, test:

- [ ] Check-in/Check-out functionality
- [ ] Daily task log creation
- [ ] Work summary generation
- [ ] Leave request creation
- [ ] Leave balance tracking
- [ ] KPI creation and tracking
- [ ] 360° review submission
- [ ] Badge awarding

## Troubleshooting

### Issue: Migration conflicts with existing data

**Solution**: Review the migration file and add data transformation logic if needed.

### Issue: Foreign key constraints fail

**Solution**: Ensure all referenced records exist before creating relationships.

### Issue: Enum values don't match

**Solution**: Update enum values in the Prisma schema to match your database.

## Notes

- The migration is designed to be non-destructive
- Existing data should remain intact
- New columns have appropriate defaults
- Relations are properly indexed for performance

## Support

If you encounter any issues:
1. Check the Prisma logs
2. Review the migration file
3. Verify database permissions
4. Ensure Prisma Client is up to date

For more information, see the main implementation summary: `HR_CORE_MODULES_IMPLEMENTATION_SUMMARY.md`
