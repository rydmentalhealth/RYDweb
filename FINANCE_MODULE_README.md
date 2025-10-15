# Finance & Resource Tracking Module

A comprehensive financial management system for the RYD HR Web App that enables HR, Finance, and Directors to monitor all financial transactions, stipends, and departmental budgets with transparency, automation, and professional reporting.

## 🚀 Features Implemented

### ✅ 1. Stipends & Volunteer Allowances
- **Employee Stipend Management**: Complete stipend history linked to employee profiles
- **Stipend Types**: Monthly stipends, allowances, reimbursements, bonuses, volunteer allowances
- **Payment Tracking**: Status tracking (Pending, Approved, Paid, Rejected) with payment dates and methods
- **Bulk Operations**: CSV upload for batch payments and bulk export capabilities
- **Auto-calculation**: Monthly payout summaries and departmental expenditure tracking
- **Dashboard Integration**: Summary cards showing total payouts, pending approvals, and remaining budget

### ✅ 2. Expense Submission & Approval System
- **Multi-stage Approval Workflow**: Team Lead → Finance → Director approval chain
- **Expense Categories**: Transport, printing, outreach events, office supplies, etc.
- **File Attachments**: Receipt and document upload support (Cloudinary/AWS S3 ready)
- **Status Tracking**: Complete audit trail with timestamps and approver information
- **Digital Vouchers**: PDF voucher generation for approved expenses (framework ready)
- **Expense Ledger**: Centralized expense tracking with filtering and sorting

### ✅ 3. Departmental Budget Tracking
- **Budget Allocation**: Monthly/quarterly budget setting per department
- **Real-time Monitoring**: Live budget utilization tracking with progress indicators
- **Alert System**: Warnings when spending exceeds 80% of allocated funds
- **Budget Adjustments**: Top-up and reduction capabilities with approval tracking
- **Visual Dashboard**: Progress bars, utilization percentages, and department comparisons
- **Historical Tracking**: Complete budget modification history with audit logs

### ✅ 4. Financial Reports & Analytics
- **Automated Reporting**: Monthly summaries, departmental reports, and expense ledgers
- **Export Capabilities**: PDF and CSV export functionality
- **Analytics Dashboard**: Visual representation of spending patterns and trends
- **Departmental Breakdown**: Detailed analysis of budget utilization by department
- **Top Expenses**: Identification of highest-value expense requests
- **Trend Analysis**: Monthly spending patterns and growth tracking

## 🏗️ Technical Architecture

### Database Schema
- **Stipend Model**: Employee payments with approval tracking
- **ExpenseRequest Model**: Multi-stage approval workflow with attachments
- **DepartmentBudget Model**: Budget allocation and spending tracking
- **BudgetAdjustment Model**: Budget modification history
- **FinancialReport Model**: Automated report generation and storage

### API Endpoints
- `/api/stipends` - Stipend CRUD operations
- `/api/expenses` - Expense request management
- `/api/budgets` - Budget tracking and adjustments
- `/api/reports` - Financial report generation

### Frontend Components
- **StipendsDashboard**: Complete stipend management interface
- **ExpenseSubmission**: Expense request form with file upload
- **ExpenseApproval**: Multi-stage approval workflow interface
- **BudgetTracking**: Departmental budget monitoring dashboard
- **FinancialReports**: Analytics and reporting interface
- **FinanceDashboard**: Unified finance management interface

## 🔧 Setup Instructions

### 1. Database Migration
```bash
# Run the Prisma migration to create finance tables
npx prisma migrate dev --name add-finance-module

# Generate Prisma client
npx prisma generate
```

### 2. Seed Sample Data
```bash
# Run the finance seed script
npx ts-node prisma/seed-finance.ts
```

### 3. Environment Variables
Ensure your `.env` file includes:
```env
DATABASE_URL="your_database_connection_string"
AUTH_SECRET="your_auth_secret"
# ... other required environment variables
```

## 📊 Usage Guide

### For HR/Finance Staff
1. **Stipend Management**: Navigate to Finance → Stipends to manage employee payments
2. **Expense Approval**: Use the Approvals tab to review and approve expense requests
3. **Budget Monitoring**: Check the Budgets tab for departmental budget status
4. **Report Generation**: Access the Reports tab to generate financial summaries

### For Department Heads
1. **Expense Submission**: Submit expense requests with supporting documentation
2. **Budget Tracking**: Monitor departmental budget utilization and remaining funds
3. **Approval Workflow**: Review and approve team expense requests

### For Directors
1. **Financial Overview**: Access comprehensive financial dashboards
2. **Budget Oversight**: Monitor organization-wide budget utilization
3. **Report Review**: Access detailed financial reports and analytics

## 🔐 Security Features

- **Role-based Access Control**: Different permissions for HR, Finance, and Directors
- **Audit Trails**: Complete tracking of all financial transactions and approvals
- **Data Validation**: Comprehensive input validation and error handling
- **Secure File Upload**: Safe handling of receipts and supporting documents

## 📈 Key Metrics Tracked

- **Monthly Payouts**: Total stipends and allowances distributed
- **Expense Trends**: Monthly spending patterns and growth
- **Budget Utilization**: Department-wise budget consumption rates
- **Approval Times**: Average time for expense request approvals
- **Over-budget Alerts**: Departments exceeding budget allocations

## 🚧 Pending Features

The following features are planned for future implementation:

### File Upload System
- Cloudinary/AWS S3 integration for secure file storage
- Image optimization and PDF processing
- File type validation and virus scanning

### Notification System
- Email notifications for approval workflows
- In-app notifications for status updates
- SMS alerts for critical budget overruns

### PDF Generation
- Automated voucher generation for approved expenses
- Customizable report templates
- Batch PDF generation for reports

### Advanced Analytics
- Interactive charts and graphs
- Predictive budget modeling
- Cost center analysis

## 🎯 Business Impact

### Transparency
- Complete visibility into all financial transactions
- Real-time budget monitoring and alerts
- Comprehensive audit trails for compliance

### Efficiency
- Streamlined approval workflows
- Automated report generation
- Bulk operations for large-scale payments

### Accountability
- Clear responsibility tracking for approvals
- Department-wise budget accountability
- Historical tracking of all modifications

### Professional Reporting
- Board-ready financial summaries
- Departmental performance metrics
- Compliance-ready documentation

## 🔄 Integration Points

### Existing HR System
- Employee profile integration for stipend management
- Department and role-based access control
- User authentication and authorization

### External Systems
- Payment gateway integration (ready for implementation)
- Email service integration for notifications
- Cloud storage for document management

## 📝 API Documentation

### Stipends API
```typescript
GET /api/stipends - List stipends with filtering
POST /api/stipends - Create new stipend
PATCH /api/stipends/[id] - Update stipend status
DELETE /api/stipends/[id] - Delete stipend
```

### Expenses API
```typescript
GET /api/expenses - List expense requests
POST /api/expenses - Submit expense request
PATCH /api/expenses/[id] - Update approval status
DELETE /api/expenses/[id] - Delete expense request
```

### Budgets API
```typescript
GET /api/budgets - List departmental budgets
POST /api/budgets - Create new budget
PATCH /api/budgets/[id] - Update budget allocation
```

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Ensure DATABASE_URL is correctly configured
2. **Permission Errors**: Check user roles and access permissions
3. **File Upload**: Verify file size limits and supported formats
4. **Report Generation**: Ensure sufficient server resources for large reports

### Support
For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Built with ❤️ for RYD Mental Health Organization**

*This module provides a solid foundation for comprehensive financial management while maintaining security, transparency, and ease of use.*
