// Email Service using Resend integration
// Reference: Replit Resend connector blueprint

import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

// Email template types
export type EmailTemplateType = 
  | 'welcome'
  | 'schedule_assigned'
  | 'schedule_updated'
  | 'schedule_cancelled'
  | 'document_approved'
  | 'document_rejected'
  | 'document_expiring'
  | 'project_invitation'
  | 'account_deletion_requested'
  | 'account_deletion_completed';

// Template data interfaces
export interface WelcomeEmailData {
  firstName: string;
  role: string;
}

export interface ScheduleEmailData {
  firstName: string;
  projectName: string;
  hospitalName: string;
  shiftDate: string;
  shiftTime: string;
  shiftType: string;
}

export interface DocumentEmailData {
  firstName: string;
  documentType: string;
  status?: string;
  expirationDate?: string;
  rejectionReason?: string;
}

export interface ProjectInvitationData {
  firstName: string;
  projectName: string;
  hospitalName: string;
  startDate: string;
  endDate: string;
}

export interface AccountDeletionData {
  firstName: string;
  requestDate?: string;
}

// Email templates with subject and body
const emailTemplates: Record<EmailTemplateType, { subject: string; getHtml: (data: any) => string }> = {
  welcome: {
    subject: 'Welcome to NICEHR - Your Healthcare Career Platform',
    getHtml: (data: WelcomeEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to NICEHR</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Healthcare Consultant Management Platform</p>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">Welcome to NICEHR! Your account has been successfully created as a <strong>${data.role}</strong>.</p>
    <p style="font-size: 16px;">Here's what you can do next:</p>
    <ul style="font-size: 16px; padding-left: 20px;">
      <li>Complete your profile with your experience and certifications</li>
      <li>Upload your required documents</li>
      <li>Set your availability preferences</li>
      <li>Browse available projects and opportunities</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/profile" style="background: #0891b2; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Complete Your Profile</a>
    </div>
    <p style="font-size: 14px; color: #64748b;">If you have any questions, please contact our support team.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  schedule_assigned: {
    subject: 'New Schedule Assignment - NICEHR',
    getHtml: (data: ScheduleEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">New Schedule Assignment</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">You have been assigned to a new shift. Here are the details:</p>
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #64748b;">Project:</td><td style="padding: 8px 0; font-weight: 600;">${data.projectName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Hospital:</td><td style="padding: 8px 0; font-weight: 600;">${data.hospitalName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Time:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftTime}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Shift Type:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftType}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/my-schedule" style="background: #0891b2; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">View My Schedule</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  schedule_updated: {
    subject: 'Schedule Update - NICEHR',
    getHtml: (data: ScheduleEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Schedule Updated</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">Your schedule has been updated. Please review the new details:</p>
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #64748b;">Project:</td><td style="padding: 8px 0; font-weight: 600;">${data.projectName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Hospital:</td><td style="padding: 8px 0; font-weight: 600;">${data.hospitalName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Time:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftTime}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Shift Type:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftType}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/my-schedule" style="background: #f59e0b; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">View Updated Schedule</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  schedule_cancelled: {
    subject: 'Schedule Cancelled - NICEHR',
    getHtml: (data: ScheduleEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Schedule Cancelled</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">We regret to inform you that the following shift has been cancelled:</p>
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #64748b;">Project:</td><td style="padding: 8px 0; font-weight: 600;">${data.projectName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Hospital:</td><td style="padding: 8px 0; font-weight: 600;">${data.hospitalName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Time:</td><td style="padding: 8px 0; font-weight: 600;">${data.shiftTime}</td></tr>
      </table>
    </div>
    <p style="font-size: 16px;">Please contact us if you have any questions about this cancellation.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/my-schedule" style="background: #64748b; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">View My Schedule</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  document_approved: {
    subject: 'Document Approved - NICEHR',
    getHtml: (data: DocumentEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Document Approved</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">Great news! Your <strong>${data.documentType}</strong> document has been approved.</p>
    <div style="background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
      <span style="color: #166534; font-weight: 600; font-size: 18px;">&#10003; Approved</span>
    </div>
    <p style="font-size: 16px;">Your document is now on file and valid for upcoming assignments.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/my-documents" style="background: #22c55e; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">View My Documents</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  document_rejected: {
    subject: 'Document Requires Attention - NICEHR',
    getHtml: (data: DocumentEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Document Requires Attention</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">Unfortunately, your <strong>${data.documentType}</strong> document could not be approved.</p>
    ${data.rejectionReason ? `
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #991b1b; margin: 0;"><strong>Reason:</strong> ${data.rejectionReason}</p>
    </div>
    ` : ''}
    <p style="font-size: 16px;">Please review the feedback and upload an updated document.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/my-documents" style="background: #ef4444; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Upload New Document</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  document_expiring: {
    subject: 'Document Expiring Soon - NICEHR',
    getHtml: (data: DocumentEmailData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Document Expiring Soon</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">Your <strong>${data.documentType}</strong> document will expire on <strong>${data.expirationDate}</strong>.</p>
    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
      <span style="color: #92400e; font-weight: 600;">&#9888; Expires: ${data.expirationDate}</span>
    </div>
    <p style="font-size: 16px;">Please upload an updated document to maintain your eligibility for assignments.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/my-documents" style="background: #f59e0b; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Update Document</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  project_invitation: {
    subject: 'Project Invitation - NICEHR',
    getHtml: (data: ProjectInvitationData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">New Project Invitation</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">You have been invited to participate in a new project:</p>
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; font-size: 15px;">
        <tr><td style="padding: 8px 0; color: #64748b;">Project:</td><td style="padding: 8px 0; font-weight: 600;">${data.projectName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Hospital:</td><td style="padding: 8px 0; font-weight: 600;">${data.hospitalName}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">Start Date:</td><td style="padding: 8px 0; font-weight: 600;">${data.startDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #64748b;">End Date:</td><td style="padding: 8px 0; font-weight: 600;">${data.endDate}</td></tr>
      </table>
    </div>
    <p style="font-size: 16px;">Log in to view the full project details and respond to this invitation.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/projects" style="background: #8b5cf6; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">View Project</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  account_deletion_requested: {
    subject: 'Account Deletion Request Received - NICEHR',
    getHtml: (data: AccountDeletionData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Account Deletion Request</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">We received your request to delete your NICEHR account on ${data.requestDate}.</p>
    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="color: #92400e; margin: 0;"><strong>Important:</strong> Your account will be reviewed for deletion by our team. You may cancel this request at any time before it is processed.</p>
    </div>
    <p style="font-size: 16px;">If you did not request this deletion or have changed your mind, please log in and cancel the request in your Account Settings.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.REPLIT_DEV_DOMAIN ? 'https://' + process.env.REPLIT_DEV_DOMAIN : 'https://nicehr.replit.app'}/account" style="background: #64748b; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">View Account Settings</a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  },

  account_deletion_completed: {
    subject: 'Account Deleted - NICEHR',
    getHtml: (data: AccountDeletionData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Account Deleted</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px;">Hello ${data.firstName},</p>
    <p style="font-size: 16px;">Your NICEHR account has been successfully deleted as requested.</p>
    <p style="font-size: 16px;">All your personal data has been removed from our systems in accordance with our privacy policy.</p>
    <p style="font-size: 16px;">We're sorry to see you go. If you ever want to return, you're always welcome to create a new account.</p>
    <p style="font-size: 16px; margin-top: 30px;">Thank you for being part of NICEHR.</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">NICEHR - Connecting Healthcare Professionals with Opportunities</p>
  </div>
</body>
</html>`
  }
};

// Email notification log entry
export interface EmailNotificationLog {
  userId: string;
  templateType: EmailTemplateType;
  recipientEmail: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
  sentAt: Date;
}

// In-memory log for now (can be moved to database later)
const emailLogs: EmailNotificationLog[] = [];

// Main email sending function
export async function sendEmail(
  to: string,
  templateType: EmailTemplateType,
  data: any,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = emailTemplates[templateType];
    if (!template) {
      throw new Error(`Unknown email template: ${templateType}`);
    }

    const { client, fromEmail } = await getResendClient();
    
    const result = await client.emails.send({
      from: fromEmail || 'NICEHR <noreply@nicehr.com>',
      to: [to],
      subject: template.subject,
      html: template.getHtml(data)
    });

    // Log success
    const logEntry: EmailNotificationLog = {
      userId: userId || 'unknown',
      templateType,
      recipientEmail: to,
      subject: template.subject,
      status: 'sent',
      sentAt: new Date()
    };
    emailLogs.push(logEntry);
    console.log(`[Email] Sent ${templateType} email to ${to}`);

    return { success: true };
  } catch (error: any) {
    // Log failure
    const logEntry: EmailNotificationLog = {
      userId: userId || 'unknown',
      templateType,
      recipientEmail: to,
      subject: emailTemplates[templateType]?.subject || 'Unknown',
      status: 'failed',
      error: error.message,
      sentAt: new Date()
    };
    emailLogs.push(logEntry);
    console.error(`[Email] Failed to send ${templateType} email to ${to}:`, error.message);

    return { success: false, error: error.message };
  }
}

// Helper function to check if user has email notifications enabled
export async function shouldSendEmail(user: { emailNotifications?: boolean; email?: string | null }): Promise<boolean> {
  return user.emailNotifications !== false && !!user.email;
}

// Get recent email logs (for admin panel)
export function getEmailLogs(limit: number = 100): EmailNotificationLog[] {
  return emailLogs.slice(-limit);
}

// Notification helper functions
export async function sendWelcomeEmail(user: { id: string; email: string | null; firstName: string | null; role: string; emailNotifications?: boolean }) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'welcome',
    {
      firstName: user.firstName || 'User',
      role: user.role === 'consultant' ? 'Healthcare Consultant' : 
            user.role === 'hospital_staff' ? 'Hospital Staff' : 
            user.role === 'admin' ? 'Administrator' : user.role
    },
    user.id
  );
}

export async function sendScheduleAssignedEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  scheduleData: { projectName: string; hospitalName: string; shiftDate: string; shiftTime: string; shiftType: string }
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'schedule_assigned',
    {
      firstName: user.firstName || 'Consultant',
      ...scheduleData
    },
    user.id
  );
}

export async function sendScheduleUpdatedEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  scheduleData: { projectName: string; hospitalName: string; shiftDate: string; shiftTime: string; shiftType: string }
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'schedule_updated',
    {
      firstName: user.firstName || 'Consultant',
      ...scheduleData
    },
    user.id
  );
}

export async function sendScheduleCancelledEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  scheduleData: { projectName: string; hospitalName: string; shiftDate: string; shiftTime: string }
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'schedule_cancelled',
    {
      firstName: user.firstName || 'Consultant',
      ...scheduleData
    },
    user.id
  );
}

export async function sendDocumentApprovedEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  documentType: string
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'document_approved',
    {
      firstName: user.firstName || 'Consultant',
      documentType
    },
    user.id
  );
}

export async function sendDocumentRejectedEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  documentType: string,
  rejectionReason?: string
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'document_rejected',
    {
      firstName: user.firstName || 'Consultant',
      documentType,
      rejectionReason
    },
    user.id
  );
}

export async function sendDocumentExpiringEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  documentType: string,
  expirationDate: string
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'document_expiring',
    {
      firstName: user.firstName || 'Consultant',
      documentType,
      expirationDate
    },
    user.id
  );
}

export async function sendProjectInvitationEmail(
  user: { id: string; email: string | null; firstName: string | null; emailNotifications?: boolean },
  projectData: { projectName: string; hospitalName: string; startDate: string; endDate: string }
) {
  if (!await shouldSendEmail(user)) return;
  
  await sendEmail(
    user.email!,
    'project_invitation',
    {
      firstName: user.firstName || 'Consultant',
      ...projectData
    },
    user.id
  );
}

export async function sendAccountDeletionRequestedEmail(
  user: { id: string; email: string | null; firstName: string | null },
  requestDate: string
) {
  if (!user.email) return;
  
  await sendEmail(
    user.email,
    'account_deletion_requested',
    {
      firstName: user.firstName || 'User',
      requestDate
    },
    user.id
  );
}

export async function sendAccountDeletionCompletedEmail(
  email: string,
  firstName: string,
  userId: string
) {
  await sendEmail(
    email,
    'account_deletion_completed',
    { firstName: firstName || 'User' },
    userId
  );
}
