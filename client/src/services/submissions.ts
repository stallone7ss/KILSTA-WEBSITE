import { apiSend } from '../lib/api';
import type { ContactFormValues, QuoteFormValues, RegistrationFormValues } from '../lib/validation';
import type { SubmissionReceipt } from '../types';

export async function submitQuote(values: QuoteFormValues): Promise<SubmissionReceipt> {
  const response = await apiSend<SubmissionReceipt>('/quotes', 'POST', values);
  return response.data;
}

export async function submitContact(values: ContactFormValues): Promise<SubmissionReceipt> {
  const response = await apiSend<SubmissionReceipt>('/contact', 'POST', values);
  return response.data;
}

export async function submitRegistration(
  values: RegistrationFormValues
): Promise<SubmissionReceipt> {
  const response = await apiSend<SubmissionReceipt>('/course-registrations', 'POST', values);
  return response.data;
}

/** Honest wording for transactional email states. Never implies delivery. */
export function notificationNote(status: SubmissionReceipt['notifications']['customer']): string {
  if (status === 'sent') {
    return 'An automatic confirmation email was accepted by our email provider.';
  }
  if (status === 'failed') {
    return 'Automatic email confirmation could not be sent, but your submission has been recorded.';
  }
  return 'Automatic email confirmation is not enabled on this deployment. Your submission has still been recorded.';
}
