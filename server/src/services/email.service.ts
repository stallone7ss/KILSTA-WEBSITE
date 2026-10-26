import nodemailer, { type Transporter } from 'nodemailer';
import type { AppConfig } from '../config/env';
import type { Logger } from '../utils/logger';

export type EmailDeliveryStatus = 'sent' | 'failed' | 'skipped';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export interface EmailResult {
  status: EmailDeliveryStatus;
  provider: 'smtp' | 'resend' | 'none';
  messageId?: string;
  /** Safe, truncated reason for failure/skip. Never contains credentials. */
  reason?: string;
}

export interface EmailService {
  readonly provider: 'smtp' | 'resend' | 'none';
  send(message: EmailMessage): Promise<EmailResult>;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/\s+/g, ' ').slice(0, 200);
}

export function createEmailService(config: AppConfig, logger: Logger): EmailService {
  const provider = config.EMAIL_PROVIDER;
  let transporter: Transporter | null = null;

  const notConfiguredReason = (): string | null => {
    if (provider === 'none') return 'Transactional email is disabled (EMAIL_PROVIDER=none).';
    if (provider === 'resend' && !config.EMAIL_API_KEY) return 'EMAIL_API_KEY is not configured.';
    if (provider === 'smtp' && !config.SMTP_HOST) return 'SMTP_HOST is not configured.';
    return null;
  };

  const getTransporter = (): Transporter => {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_SECURE,
        auth:
          config.SMTP_USER && config.SMTP_PASSWORD
            ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD }
            : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000
      });
    }
    return transporter;
  };

  return {
    provider,
    async send(message: EmailMessage): Promise<EmailResult> {
      const configurationIssue = notConfiguredReason();
      if (configurationIssue) {
        logger.warn('Email not sent: provider not configured', {
          provider,
          reason: configurationIssue
        });
        return { status: 'skipped', provider, reason: configurationIssue };
      }

      try {
        if (provider === 'resend') {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${config.EMAIL_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: config.EMAIL_FROM,
              to: [message.to],
              subject: message.subject,
              html: message.html,
              text: message.text,
              reply_to: message.replyTo
            }),
            signal: AbortSignal.timeout(12_000)
          });

          const payload = (await response.json().catch(() => null)) as
            | { id?: string; message?: string }
            | null;

          if (!response.ok) {
            logger.error('Resend rejected an email', {
              status: response.status,
              reason: payload?.message?.slice(0, 200)
            });
            return {
              status: 'failed',
              provider,
              reason: `Email provider returned HTTP ${response.status}.`
            };
          }
          return { status: 'sent', provider, messageId: payload?.id };
        }

        const info = await getTransporter().sendMail({
          from: config.EMAIL_FROM,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          replyTo: message.replyTo
        });
        return { status: 'sent', provider: 'smtp', messageId: info.messageId };
      } catch (error) {
        logger.error('Email delivery failed', { provider, reason: safeReason(error) });
        return {
          status: 'failed',
          provider,
          reason: 'The email provider could not be reached or rejected the message.'
        };
      }
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                   */
/* -------------------------------------------------------------------------- */

const BRAND = {
  name: 'KILSTA Business & ICT Consultants',
  email: 'kilsta2023@gmail.com',
  phone: '+675 82545274',
  location: 'Gumini Village, Huhu LLG, Alotau District, Milne Bay Province, Papua New Guinea',
  postal: 'P.O. Box 424, Alotau, Milne Bay Province, Papua New Guinea'
};

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;background:#f4f7fb;color:#10233f;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #dbe4ef;">
        <tr><td style="background:#0a1f44;padding:22px 28px;">
          <div style="color:#ffffff;font-size:18px;font-weight:bold;letter-spacing:0.3px;">KILSTA</div>
          <div style="color:#8fd8d0;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;">Business &amp; ICT Consultants</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:20px;color:#0a1f44;">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f7f9fc;border-top:1px solid #e4ebf3;font-size:12px;color:#5a6b82;">
          <div>${escapeHtml(BRAND.name)}</div>
          <div>${escapeHtml(BRAND.location)}</div>
          <div>${escapeHtml(BRAND.postal)}</div>
          <div>Phone: ${escapeHtml(BRAND.phone)} · Email: ${escapeHtml(BRAND.email)}</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;color:#33465f;">${text}</p>`;
}

export interface QuoteEmailData {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string | null;
  serviceCategory: string;
  requestedService: string;
  projectDescription: string;
  preferredContactMethod: string;
  budgetRange?: string | null;
  preferredCompletionDate?: string | null;
  submittedAt: string;
}

export function quoteAcknowledgementEmail(data: QuoteEmailData): EmailMessage {
  const html = shell(
    'We received your quote request',
    `${p(`Dear ${escapeHtml(data.fullName)},`)}
     ${p('Thank you for contacting KILSTA Business &amp; ICT Consultants. Your request has been recorded with the reference below.')}
     <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
       <tr><td style="padding:8px 0;color:#5a6b82;">Reference</td><td style="padding:8px 0;font-weight:bold;">${escapeHtml(data.reference)}</td></tr>
       <tr><td style="padding:8px 0;color:#5a6b82;">Service area</td><td style="padding:8px 0;">${escapeHtml(data.serviceCategory)}</td></tr>
       <tr><td style="padding:8px 0;color:#5a6b82;">Requested service</td><td style="padding:8px 0;">${escapeHtml(data.requestedService)}</td></tr>
       <tr><td style="padding:8px 0;color:#5a6b82;">Preferred contact</td><td style="padding:8px 0;">${escapeHtml(data.preferredContactMethod)}</td></tr>
     </table>
     ${p('This message confirms that your request was received. It is <strong>not a quotation</strong>. Our team will review the details and respond using your preferred contact method.')}
     ${p('If anything changes, reply to this email and quote your reference number.')}
     ${p('Kind regards,<br>KILSTA Business &amp; ICT Consultants')}`
  );
  const text = [
    `Dear ${data.fullName},`,
    '',
    'Thank you for contacting KILSTA Business & ICT Consultants. Your quote request has been recorded.',
    `Reference: ${data.reference}`,
    `Service area: ${data.serviceCategory}`,
    `Requested service: ${data.requestedService}`,
    `Preferred contact: ${data.preferredContactMethod}`,
    '',
    'This message confirms receipt of your request. It is not a quotation. Our team will review it and respond using your preferred contact method.',
    '',
    'KILSTA Business & ICT Consultants',
    BRAND.phone,
    BRAND.email
  ].join('\n');

  return {
    to: data.email,
    subject: `Quote request received — ${data.reference}`,
    html,
    text,
    replyTo: BRAND.email
  };
}

export function quoteBusinessNotificationEmail(data: QuoteEmailData): EmailMessage {
  const rows = [
    ['Reference', data.reference],
    ['Name', data.fullName],
    ['Organization', data.organization || '—'],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Service category', data.serviceCategory],
    ['Requested service', data.requestedService],
    ['Preferred contact', data.preferredContactMethod],
    ['Budget range', data.budgetRange || '—'],
    ['Preferred completion', data.preferredCompletionDate || '—'],
    ['Submitted', data.submittedAt]
  ];
  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:7px 0;color:#5a6b82;width:38%;">${escapeHtml(label)}</td><td style="padding:7px 0;">${escapeHtml(value)}</td></tr>`
    )
    .join('');
  const html = shell(
    `New quote request — ${data.reference}`,
    `${tableRows ? `<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">${tableRows}</table>` : ''}
     <h2 style="font-size:15px;margin:0 0 8px;color:#0a1f44;">Project description</h2>
     <div style="white-space:pre-wrap;font-size:14px;background:#f7f9fc;border:1px solid #e4ebf3;border-radius:8px;padding:14px;">${escapeHtml(data.projectDescription)}</div>
     ${p('<br>Reply to this email to contact the customer directly.')}`
  );
  const text = [
    `New quote request ${data.reference}`,
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Project description:',
    data.projectDescription
  ].join('\n');

  return {
    to: '', // filled by caller with ADMIN_NOTIFICATION_EMAIL
    subject: `New quote request — ${data.reference}`,
    html,
    text,
    replyTo: data.email
  };
}

export interface ContactEmailData {
  fullName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  subject: string;
  message: string;
  submittedAt: string;
}

export function contactAcknowledgementEmail(data: ContactEmailData): EmailMessage {
  return {
    to: data.email,
    subject: 'We received your message — KILSTA Business & ICT Consultants',
    replyTo: BRAND.email,
    html: shell(
      'We received your message',
      `${p(`Dear ${escapeHtml(data.fullName)},`)}
       ${p('Thank you for contacting KILSTA Business &amp; ICT Consultants. Your message has been recorded and our team will respond as soon as possible.')}
       ${p(`<strong>Subject:</strong> ${escapeHtml(data.subject)}`)}
       ${p('This is an acknowledgement of receipt only.')}
       ${p('Kind regards,<br>KILSTA Business &amp; ICT Consultants')}`
    ),
    text: [
      `Dear ${data.fullName},`,
      '',
      `Thank you for contacting KILSTA Business & ICT Consultants. Your message "${data.subject}" has been recorded. Our team will respond as soon as possible.`,
      '',
      'This is an acknowledgement of receipt only.',
      '',
      'KILSTA Business & ICT Consultants',
      BRAND.phone,
      BRAND.email
    ].join('\n')
  };
}

export function contactBusinessNotificationEmail(data: ContactEmailData): EmailMessage {
  const html = shell(
    'New website enquiry',
    `<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
       <tr><td style="padding:7px 0;color:#5a6b82;width:34%;">Name</td><td>${escapeHtml(data.fullName)}</td></tr>
       <tr><td style="padding:7px 0;color:#5a6b82;">Email</td><td>${escapeHtml(data.email)}</td></tr>
       <tr><td style="padding:7px 0;color:#5a6b82;">Phone</td><td>${escapeHtml(data.phone || '—')}</td></tr>
       <tr><td style="padding:7px 0;color:#5a6b82;">Organization</td><td>${escapeHtml(data.organization || '—')}</td></tr>
       <tr><td style="padding:7px 0;color:#5a6b82;">Subject</td><td>${escapeHtml(data.subject)}</td></tr>
       <tr><td style="padding:7px 0;color:#5a6b82;">Received</td><td>${escapeHtml(data.submittedAt)}</td></tr>
     </table>
     <h2 style="font-size:15px;margin:0 0 8px;color:#0a1f44;">Message</h2>
     <div style="white-space:pre-wrap;font-size:14px;background:#f7f9fc;border:1px solid #e4ebf3;border-radius:8px;padding:14px;">${escapeHtml(data.message)}</div>`
  );
  return {
    to: '',
    subject: `New website enquiry — ${data.subject}`,
    html,
    text: `New website enquiry\n\nName: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone || '—'}\nSubject: ${data.subject}\n\n${data.message}`,
    replyTo: data.email
  };
}

export interface RegistrationEmailData {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  organization?: string | null;
  courseTitle: string;
  preferredStartDate?: string | null;
  message?: string | null;
  submittedAt: string;
}

export function registrationAcknowledgementEmail(data: RegistrationEmailData): EmailMessage {
  return {
    to: data.email,
    subject: `Training registration received — ${data.reference}`,
    replyTo: BRAND.email,
    html: shell(
      'We received your training registration',
      `${p(`Dear ${escapeHtml(data.fullName)},`)}
       ${p('Thank you for registering your interest in KILSTA training. Your registration has been recorded with the reference below.')}
       <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
         <tr><td style="padding:8px 0;color:#5a6b82;">Reference</td><td style="font-weight:bold;">${escapeHtml(data.reference)}</td></tr>
         <tr><td style="padding:8px 0;color:#5a6b82;">Course</td><td>${escapeHtml(data.courseTitle)}</td></tr>
         <tr><td style="padding:8px 0;color:#5a6b82;">Preferred start</td><td>${escapeHtml(data.preferredStartDate || 'To be discussed')}</td></tr>
       </table>
       ${p('This confirms receipt only. A place is <strong>not yet confirmed</strong>; our team will contact you about schedule, fees and availability.')}
       ${p('Kind regards,<br>KILSTA Business &amp; ICT Consultants')}`
    ),
    text: [
      `Dear ${data.fullName},`,
      '',
      'Thank you for registering your interest in KILSTA training. Your registration has been recorded.',
      `Reference: ${data.reference}`,
      `Course: ${data.courseTitle}`,
      `Preferred start: ${data.preferredStartDate || 'To be discussed'}`,
      '',
      'This confirms receipt only. A place is not yet confirmed; our team will contact you about schedule, fees and availability.',
      '',
      'KILSTA Business & ICT Consultants',
      BRAND.phone,
      BRAND.email
    ].join('\n')
  };
}

export function registrationBusinessNotificationEmail(data: RegistrationEmailData): EmailMessage {
  return {
    to: '',
    subject: `New training registration — ${data.courseTitle} (${data.reference})`,
    replyTo: data.email,
    html: shell(
      `New training registration — ${data.reference}`,
      `<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
         <tr><td style="padding:7px 0;color:#5a6b82;width:34%;">Name</td><td>${escapeHtml(data.fullName)}</td></tr>
         <tr><td style="padding:7px 0;color:#5a6b82;">Email</td><td>${escapeHtml(data.email)}</td></tr>
         <tr><td style="padding:7px 0;color:#5a6b82;">Phone</td><td>${escapeHtml(data.phone)}</td></tr>
         <tr><td style="padding:7px 0;color:#5a6b82;">Organization</td><td>${escapeHtml(data.organization || '—')}</td></tr>
         <tr><td style="padding:7px 0;color:#5a6b82;">Course</td><td>${escapeHtml(data.courseTitle)}</td></tr>
         <tr><td style="padding:7px 0;color:#5a6b82;">Preferred start</td><td>${escapeHtml(data.preferredStartDate || '—')}</td></tr>
         <tr><td style="padding:7px 0;color:#5a6b82;">Reference</td><td>${escapeHtml(data.reference)}</td></tr>
       </table>
       ${data.message ? `<h2 style="font-size:15px;margin:0 0 8px;color:#0a1f44;">Message</h2><div style="white-space:pre-wrap;font-size:14px;background:#f7f9fc;border:1px solid #e4ebf3;border-radius:8px;padding:14px;">${escapeHtml(data.message)}</div>` : ''}`
    ),
    text: `New training registration ${data.reference}\n\nName: ${data.fullName}\nCourse: ${data.courseTitle}\nEmail: ${data.email}\nPhone: ${data.phone}\nPreferred start: ${data.preferredStartDate || '—'}\n\n${data.message || ''}`
  };
}

export const companyContact = BRAND;
