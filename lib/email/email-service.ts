import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  employeeName: string;
  employeeId: string;
  email: string;
  temporaryPassword: string;
  portalUrl: string;
  hrContactEmail: string;
  organizationName: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const subject = `Welcome to ${data.organizationName} - Your Employee Portal Access`;
    
    const html = this.generateWelcomeEmailHTML(data);
    const text = this.generateWelcomeEmailText(data);

    return this.sendEmail({
      to: data.email,
      subject,
      html,
      text,
    });
  }

  private generateWelcomeEmailHTML(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${data.organizationName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .credentials {
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 6px;
              padding: 20px;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background: #007bff;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              font-size: 14px;
              color: #6c757d;
            }
            .highlight {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 4px;
              padding: 10px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to ${data.organizationName}!</h1>
            <p>We're excited to have you join our team</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.employeeName}!</h2>
            
            <p>Welcome to the ${data.organizationName} family! We're thrilled to have you as part of our team and look forward to working together to make a positive impact in our community.</p>
            
            <div class="credentials">
              <h3>Your Employee Portal Access</h3>
              <p><strong>Employee ID:</strong> ${data.employeeId}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Temporary Password:</strong> <code>${data.temporaryPassword}</code></p>
              
              <div class="highlight">
                <strong>Important:</strong> Please change your password after your first login for security purposes.
              </div>
              
              <a href="${data.portalUrl}" class="button">Access Your Portal</a>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your onboarding checklist in the employee portal</li>
              <li>Review the employee handbook and organizational policies</li>
              <li>Set up your profile with a photo and contact information</li>
              <li>Familiarize yourself with our mental health resources and programs</li>
            </ul>
            
            <h3>Getting Started</h3>
            <p>Your onboarding checklist includes essential tasks like:</p>
            <ul>
              <li>📋 Mission Statement Review</li>
              <li>📄 Code of Conduct Acknowledgment</li>
              <li>🎓 Mental Health Policy Training</li>
              <li>📝 Document Submission</li>
              <li>💻 IT Systems Access Setup</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our HR team at <a href="mailto:${data.hrContactEmail}">${data.hrContactEmail}</a>.</p>
            
            <p>Once again, welcome to the team! We're excited to see the great work you'll do.</p>
            
            <p>Best regards,<br>
            The ${data.organizationName} Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${data.email}. If you have any questions, please contact HR at ${data.hrContactEmail}.</p>
            <p>&copy; ${new Date().getFullYear()} ${data.organizationName}. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateWelcomeEmailText(data: WelcomeEmailData): string {
    return `
Welcome to ${data.organizationName}!

Hello ${data.employeeName}!

Welcome to the ${data.organizationName} family! We're thrilled to have you as part of our team and look forward to working together to make a positive impact in our community.

YOUR EMPLOYEE PORTAL ACCESS:
- Employee ID: ${data.employeeId}
- Email: ${data.email}
- Temporary Password: ${data.temporaryPassword}

IMPORTANT: Please change your password after your first login for security purposes.

Portal URL: ${data.portalUrl}

WHAT'S NEXT?
- Complete your onboarding checklist in the employee portal
- Review the employee handbook and organizational policies
- Set up your profile with a photo and contact information
- Familiarize yourself with our mental health resources and programs

GETTING STARTED:
Your onboarding checklist includes essential tasks like:
- Mission Statement Review
- Code of Conduct Acknowledgment
- Mental Health Policy Training
- Document Submission
- IT Systems Access Setup

If you have any questions or need assistance, please don't hesitate to reach out to our HR team at ${data.hrContactEmail}.

Once again, welcome to the team! We're excited to see the great work you'll do.

Best regards,
The ${data.organizationName} Team

---
This email was sent to ${data.email}. If you have any questions, please contact HR at ${data.hrContactEmail}.
© ${new Date().getFullYear()} ${data.organizationName}. All rights reserved.
    `;
  }

  async sendOnboardingReminderEmail(data: {
    employeeName: string;
    employeeId: string;
    email: string;
    portalUrl: string;
    incompleteItems: string[];
    hrContactEmail: string;
  }): Promise<boolean> {
    const subject = `Onboarding Reminder - ${data.incompleteItems.length} tasks remaining`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Onboarding Reminder</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
            .highlight { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Onboarding Reminder</h2>
          </div>
          
          <div class="content">
            <h3>Hello ${data.employeeName}!</h3>
            
            <p>This is a friendly reminder that you have <strong>${data.incompleteItems.length}</strong> onboarding tasks remaining to complete.</p>
            
            <div class="highlight">
              <h4>Remaining Tasks:</h4>
              <ul>
                ${data.incompleteItems.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <p>Please log in to your employee portal to complete these tasks:</p>
            
            <a href="${data.portalUrl}" class="button">Complete Onboarding</a>
            
            <p>If you have any questions, please contact HR at ${data.hrContactEmail}.</p>
            
            <p>Best regards,<br>
            The HR Team</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: data.email,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
