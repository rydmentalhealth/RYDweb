# HR Modules Quick Start Guide

## 🚀 Getting Started

Welcome to the enhanced RYD HR system! This guide will help you get up and running quickly.

## 📦 What's New

Three new comprehensive modules have been added:
1. **Attendance & Work Tracking** (`/dashboard/attendance`)
2. **Leave & Availability** (`/dashboard/leave`)
3. **Performance & Evaluation** (`/dashboard/performance`)

## 🛠️ Setup Instructions

### Step 1: Update Dependencies

All required dependencies are already in `package.json`. Just run:

```bash
npm install
```

### Step 2: Apply Database Migrations

```bash
# Format the Prisma schema
npx prisma format

# Create and apply the migration
npx prisma migrate dev --name add_enhanced_hr_modules

# Generate Prisma Client
npx prisma generate
```

### Step 3: Seed Initial Data (Optional)

Create a seed file or use Prisma Studio to add:
- Default leave types (Annual, Sick, Study)
- Default reward badges
- Leave balances for existing employees

### Step 4: Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/dashboard/attendance` to see the new modules!

## 🎯 Key Features Overview

### Attendance Module
- ✅ One-click check-in/out
- ✅ Optional geolocation tracking
- ✅ Daily task logging
- ✅ Real-time team status
- ✅ Monthly summaries with export

**Try it**: 
1. Go to `/dashboard/attendance`
2. Click "Check In"
3. Add a daily task log
4. View your work summary

### Leave Module
- ✅ Easy leave request submission
- ✅ Automatic balance tracking
- ✅ Approval workflow
- ✅ Team availability calendar

**Try it**:
1. Go to `/dashboard/leave`
2. Click "Request Leave"
3. Select dates and type
4. View your leave balance

### Performance Module
- ✅ KPI creation and tracking
- ✅ 360° reviews
- ✅ Rewards and badges
- ✅ Progress visualization

**Try it**:
1. Go to `/dashboard/performance`
2. Create a new KPI
3. Track your progress
4. View earned badges

## 🔑 Role-Based Access

Different roles see different features:

| Feature | Volunteer | Staff | Team Lead | HR Officer | Admin |
|---------|-----------|-------|-----------|------------|-------|
| Check In/Out | ✅ | ✅ | ✅ | ✅ | ✅ |
| Daily Logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team Status | ❌ | ❌ | ✅ | ✅ | ✅ |
| Leave Request | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Leave | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage KPIs | ❌ | ❌ | ✅ | ✅ | ✅ |
| Award Badges | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Reports | ❌ | ❌ | ✅ | ✅ | ✅ |

## 📁 File Structure

```
/app
  /dashboard
    /attendance
      page.tsx                    # Main attendance page
    /leave
      page.tsx                    # Main leave page
    /performance
      page.tsx                    # Main performance page
  /api
    /attendance
      /check-in/route.ts          # Check-in/out API
      /daily-logs/route.ts        # Task logs API
      /work-summary/route.ts      # Summary API
      /status/route.ts            # Status API
    /leave
      /requests/route.ts          # Leave requests API
      /balance/route.ts           # Leave balance API
      /availability/route.ts      # Availability API
      /types/route.ts             # Leave types API
    /performance
      /kpis/route.ts              # KPI management API
      /reviews-360/route.ts       # 360° reviews API
      /rewards/route.ts           # Rewards/badges API
      /stats/route.ts             # Statistics API

/components
  /attendance
    attendance-tracking-dashboard.tsx
    check-in-out-card.tsx
    daily-task-logs.tsx
    attendance-status.tsx
    work-summary.tsx
  /leave
    leave-management-dashboard.tsx
  /performance
    performance-management-dashboard.tsx
```

## 🧪 Testing the Features

### Test Attendance Flow
```bash
# 1. Check in
curl -X POST http://localhost:3000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{"action":"check-in","latitude":0.0,"longitude":0.0}'

# 2. Add daily log
curl -X POST http://localhost:3000/api/attendance/daily-logs \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-10-16","description":"Completed project tasks"}'

# 3. Check out
curl -X POST http://localhost:3000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -d '{"action":"check-out"}'
```

### Test Leave Flow
```bash
# 1. Create leave request
curl -X POST http://localhost:3000/api/leave/requests \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"xxx","type":"ANNUAL","startDate":"2025-10-20","endDate":"2025-10-22","reason":"Vacation"}'

# 2. Approve leave (as manager)
curl -X PATCH http://localhost:3000/api/leave/requests/[id] \
  -H "Content-Type: application/json" \
  -d '{"status":"APPROVED"}'
```

### Test Performance Flow
```bash
# 1. Create KPI
curl -X POST http://localhost:3000/api/performance/kpis \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"xxx","title":"Complete 10 tasks","target":10,"category":"TASK_COMPLETION","startDate":"2025-10-01","endDate":"2025-10-31"}'

# 2. Update progress
curl -X PATCH http://localhost:3000/api/performance/kpis/[id] \
  -H "Content-Type: application/json" \
  -d '{"current":5}'
```

## 🎨 Customization

### Change Colors
Edit the border colors in components:
```tsx
// Example: Change attendance card color
<Card className="border-l-4 border-l-blue-500">
  // Change border-l-blue-500 to your preferred color
</Card>
```

### Add Custom Leave Types
```typescript
await prisma.leaveTypeConfig.create({
  data: {
    name: 'Sabbatical',
    code: 'SABBATICAL',
    description: 'Extended break',
    defaultDays: 90,
    color: '#8B5CF6',
  },
})
```

### Create Custom Badges
```typescript
await prisma.rewardBadge.create({
  data: {
    name: 'Innovation Champion',
    description: 'Introduced innovative solution',
    icon: '💡',
    points: 150,
    category: 'INNOVATION',
  },
})
```

## 🐛 Common Issues

### Issue: "Employee profile not found"
**Solution**: Ensure the user has an employee profile created in `/dashboard/hr`

### Issue: "Geolocation not working"
**Solution**: HTTPS is required for geolocation. Use `ngrok` or similar for testing.

### Issue: "Leave balance not showing"
**Solution**: Create leave balances for the employee:
```typescript
await prisma.leaveBalance.create({
  data: {
    employeeId: "xxx",
    leaveType: "ANNUAL",
    year: 2025,
    allocated: 21,
    remaining: 21,
  },
})
```

## 📊 Monitoring & Analytics

### Database Queries
Monitor these tables for performance:
- `CheckIn` - High write frequency
- `DailyTaskLog` - Moderate write frequency
- `LeaveRequest` - Low write frequency
- `KPI` - Moderate updates

### Indexes
Key indexes added for performance:
- `CheckIn`: `userId`, `checkInTime`
- `DailyTaskLog`: `userId`, `date`
- `LeaveRequest`: `employeeId`, `status`
- `KPI`: `employeeId`, `status`

## 🔄 Migration from Old System

If migrating from an old attendance system:

1. Export old attendance data
2. Transform to new schema
3. Bulk import using Prisma:

```typescript
await prisma.checkIn.createMany({
  data: oldAttendanceData.map(record => ({
    userId: record.userId,
    checkInTime: record.checkIn,
    checkOutTime: record.checkOut,
    workingHours: record.hours,
  })),
})
```

## 📚 Additional Resources

- [Complete Implementation Summary](./HR_CORE_MODULES_IMPLEMENTATION_SUMMARY.md)
- [Migration Instructions](./MIGRATION_INSTRUCTIONS.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs)

## 🆘 Need Help?

Check these resources:
1. API endpoint documentation (inline in route files)
2. Component documentation (inline in TSX files)
3. Prisma schema comments
4. Implementation summary document

## 🎉 You're Ready!

The HR modules are now fully set up and ready to use. Start by:
1. Creating your employee profile (if not done)
2. Checking in for the day
3. Logging your daily tasks
4. Setting up your first KPI

**Happy tracking! 🚀**
