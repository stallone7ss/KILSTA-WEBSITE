import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppConfig } from '../config/env';
import type { Database } from '../types/database.types';
import type { EmailDeliveryStatus, EmailService } from './email.service';
import {
  contactAcknowledgementEmail,
  contactBusinessNotificationEmail,
  quoteAcknowledgementEmail,
  quoteBusinessNotificationEmail,
  registrationAcknowledgementEmail,
  registrationBusinessNotificationEmail
} from './email.service';
import type {
  ContactMessageInput,
  CourseRegistrationInput,
  QuoteRequestInput
} from '../validators/public';
import type { Logger } from '../utils/logger';
import { generateReference } from '../utils/reference';
import { assertNoDbError } from '../utils/asyncHandler';
import { unprocessable } from '../utils/errors';

export interface SubmissionReceipt {
  reference: string | null;
  submittedAt: string;
  notifications: {
    customer: EmailDeliveryStatus;
    business: EmailDeliveryStatus;
  };
}

export interface SubmissionService {
  createQuoteRequest(input: QuoteRequestInput): Promise<SubmissionReceipt>;
  createContactMessage(input: ContactMessageInput): Promise<SubmissionReceipt>;
  createCourseRegistration(input: CourseRegistrationInput): Promise<SubmissionReceipt>;
}

const categoryLabel: Record<string, string> = {
  business: 'Business services',
  ict: 'ICT services',
  training: 'ICT training'
};

function formatPngDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PG', {
    timeZone: 'Pacific/Port_Moresby',
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function createSubmissionService(options: {
  getDb: () => SupabaseClient<Database>;
  email: EmailService;
  config: AppConfig;
  logger: Logger;
  now?: () => Date;
}): SubmissionService {
  const { getDb, email, config, logger } = options;
  const now = options.now ?? (() => new Date());

  async function notifyBoth(html: {
    customer: ReturnType<typeof quoteAcknowledgementEmail>;
    business: ReturnType<typeof quoteAcknowledgementEmail>;
  }): Promise<{ customer: EmailDeliveryStatus; business: EmailDeliveryStatus }> {
    const [customerResult, businessResult] = await Promise.all([
      email.send(html.customer),
      email.send({ ...html.business, to: config.ADMIN_NOTIFICATION_EMAIL })
    ]);
    return {
      customer: customerResult.status,
      business: businessResult.status
    };
  }

  return {
    async createQuoteRequest(input) {
      const db = getDb();
      const submittedAt = now();
      let reference = '';
      let rowId: string | null = null;
      let createdAt = submittedAt.toISOString();
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        reference = generateReference('KQ', submittedAt);
        const { data, error } = await db
          .from('quote_requests')
          .insert({
            reference,
            full_name: input.fullName,
            organization: input.organization ?? null,
            email: input.email,
            phone: input.phone,
            service_category: input.serviceCategory,
            requested_service: input.requestedService,
            project_description: input.projectDescription,
            preferred_contact_method: input.preferredContactMethod,
            budget_range: input.budgetRange ?? null,
            preferred_completion_date: input.preferredCompletionDate ?? null,
            contact_consent: input.contactConsent
          })
          .select('id,reference,created_at')
          .single();

        if (!error && data) {
          rowId = data.id;
          reference = data.reference;
          createdAt = data.created_at;
          break;
        }

        lastError = error;
        if (error?.code !== '23505') break;
      }

      if (!rowId) {
        assertNoDbError(
          (lastError as { code?: string; message?: string } | null) ?? {
            message: 'Quote insert returned no data'
          },
          logger,
          'submissions.createQuoteRequest'
        );
        throw unprocessable('The quote request could not be saved. Please try again.');
      }

      const emailData = {
        reference,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        organization: input.organization ?? null,
        serviceCategory: categoryLabel[input.serviceCategory] ?? input.serviceCategory,
        requestedService: input.requestedService,
        projectDescription: input.projectDescription,
        preferredContactMethod: input.preferredContactMethod,
        budgetRange: input.budgetRange ?? null,
        preferredCompletionDate: input.preferredCompletionDate ?? null,
        submittedAt: formatPngDate(createdAt)
      };

      const notifications = await notifyBoth({
        customer: quoteAcknowledgementEmail(emailData),
        business: quoteBusinessNotificationEmail(emailData)
      });

      const { error: updateError } = await db
        .from('quote_requests')
        .update({
          customer_notification_status: notifications.customer,
          business_notification_status: notifications.business,
          notification_attempted_at: now().toISOString()
        })
        .eq('id', rowId);

      if (updateError) {
        logger.error('Could not record quote notification status', {
          code: updateError.code,
          reference
        });
      }

      logger.info('Quote request recorded', {
        reference,
        serviceCategory: input.serviceCategory,
        customerNotification: notifications.customer,
        businessNotification: notifications.business
      });

      return { reference, submittedAt: createdAt, notifications };
    },

    async createContactMessage(input) {
      const db = getDb();
      const { data, error } = await db
        .from('contact_messages')
        .insert({
          full_name: input.fullName,
          email: input.email,
          phone: input.phone ?? null,
          organization: input.organization ?? null,
          subject: input.subject,
          message: input.message,
          contact_consent: input.contactConsent
        })
        .select('id,created_at')
        .single();

      assertNoDbError(error, logger, 'submissions.createContactMessage');
      if (!data) throw unprocessable('The message could not be saved. Please try again.');

      const emailData = {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        organization: input.organization ?? null,
        subject: input.subject,
        message: input.message,
        submittedAt: formatPngDate(data.created_at)
      };

      const notifications = await notifyBoth({
        customer: contactAcknowledgementEmail(emailData),
        business: contactBusinessNotificationEmail(emailData)
      });

      const { error: updateError } = await db
        .from('contact_messages')
        .update({
          customer_notification_status: notifications.customer,
          business_notification_status: notifications.business,
          notification_attempted_at: now().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        logger.error('Could not record contact notification status', {
          code: updateError.code
        });
      }

      logger.info('Contact message recorded', {
        customerNotification: notifications.customer,
        businessNotification: notifications.business
      });

      return { reference: null, submittedAt: data.created_at, notifications };
    },

    async createCourseRegistration(input) {
      const db = getDb();
      const { data: course, error: courseError } = await db
        .from('courses')
        .select('id,title')
        .eq('id', input.courseId)
        .eq('published', true)
        .maybeSingle();

      assertNoDbError(courseError, logger, 'submissions.createCourseRegistration.course');
      if (!course) {
        throw unprocessable('That course is not currently open for registration.');
      }

      const submittedAt = now();
      let reference = '';
      let rowId: string | null = null;
      let createdAt = submittedAt.toISOString();
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        reference = generateReference('KR', submittedAt);
        const { data, error } = await db
          .from('course_registrations')
          .insert({
            reference,
            course_id: course.id,
            full_name: input.fullName,
            email: input.email,
            phone: input.phone,
            organization: input.organization ?? null,
            preferred_start_date: input.preferredStartDate ?? null,
            message: input.message ?? null,
            contact_consent: input.contactConsent
          })
          .select('id,reference,created_at')
          .single();

        if (!error && data) {
          rowId = data.id;
          reference = data.reference;
          createdAt = data.created_at;
          break;
        }

        lastError = error;
        if (error?.code !== '23505') break;
      }

      if (!rowId) {
        assertNoDbError(
          (lastError as { code?: string; message?: string } | null) ?? {
            message: 'Registration insert returned no data'
          },
          logger,
          'submissions.createCourseRegistration'
        );
        throw unprocessable('The registration could not be saved. Please try again.');
      }

      const emailData = {
        reference,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        organization: input.organization ?? null,
        courseTitle: course.title,
        preferredStartDate: input.preferredStartDate ?? null,
        message: input.message ?? null,
        submittedAt: formatPngDate(createdAt)
      };

      const notifications = await notifyBoth({
        customer: registrationAcknowledgementEmail(emailData),
        business: registrationBusinessNotificationEmail(emailData)
      });

      const { error: updateError } = await db
        .from('course_registrations')
        .update({
          customer_notification_status: notifications.customer,
          business_notification_status: notifications.business,
          notification_attempted_at: now().toISOString()
        })
        .eq('id', rowId);

      if (updateError) {
        logger.error('Could not record registration notification status', {
          code: updateError.code,
          reference
        });
      }

      logger.info('Course registration recorded', {
        reference,
        customerNotification: notifications.customer,
        businessNotification: notifications.business
      });

      return { reference, submittedAt: createdAt, notifications };
    }
  };
}
