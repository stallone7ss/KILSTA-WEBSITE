import type { ContactStatus, QuoteStatus, RegistrationStatus } from '../types';

export const QUOTE_STATUSES: QuoteStatus[] = [
  'New',
  'Under Review',
  'Quoted',
  'Accepted',
  'In Progress',
  'Completed',
  'Rejected'
];

export const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  New: ['Under Review', 'Rejected'],
  'Under Review': ['Quoted', 'Rejected'],
  Quoted: ['Accepted', 'Rejected'],
  Accepted: ['In Progress', 'Rejected'],
  'In Progress': ['Completed', 'Rejected'],
  Completed: [],
  Rejected: ['Under Review']
};

export const CONTACT_STATUSES: ContactStatus[] = ['New', 'In Progress', 'Resolved'];

export const REGISTRATION_STATUSES: RegistrationStatus[] = [
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled'
];

export const REGISTRATION_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: ['Pending']
};
