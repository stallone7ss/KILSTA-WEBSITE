import { z } from 'zod';
import { CONTACT_STATUSES, QUOTE_STATUSES, REGISTRATION_STATUSES } from '../config/permissions';
import {
  emailSchema,
  optionalPastOrFutureDateSchema,
  optionalPhoneSchema,
  trimmedString
} from './common';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  sort: z.string().trim().max(40).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().trim().max(40).optional(),
  category: z.string().trim().max(60).optional(),
  published: z.enum(['true', 'false']).optional(),
  courseId: z.string().uuid().optional(),
  entityType: z.string().trim().max(40).optional(),
  action: z.string().trim().max(80).optional()
});

export type AdminListQuery = z.infer<typeof listQuerySchema>;

export const idParamSchema = z.object({ id: z.string().uuid('Invalid identifier.') });

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.');

export const quoteStatusSchema = z.enum(QUOTE_STATUSES);
export const contactStatusSchema = z.enum(CONTACT_STATUSES);
export const registrationStatusSchema = z.enum(REGISTRATION_STATUSES);

const optionalUrl = z
  .union([z.string().trim().url('Enter a valid URL.').max(1000), z.literal('')])
  .optional()
  .transform((value) => (value ? value : null));

const booleanField = z.boolean().optional();
const sortOrderField = z.coerce.number().int().min(0).max(10000).optional();

/* ------------------------------- services -------------------------------- */
export const serviceInputSchema = z.object({
  slug: slugSchema,
  title: trimmedString(2, 160, 'Title'),
  category: z.enum(['business', 'ict', 'training']),
  summary: trimmedString(10, 400, 'Summary'),
  description: z.string().trim().max(8000).default(''),
  features: z.array(z.string().trim().min(1).max(200)).max(12).default([]),
  icon: z.string().trim().max(40).optional().nullable(),
  image_url: optionalUrl,
  featured: booleanField,
  published: booleanField,
  sort_order: sortOrderField
});

export const serviceUpdateSchema = serviceInputSchema.partial();

/* -------------------------------- courses --------------------------------- */
export const courseInputSchema = z.object({
  slug: slugSchema,
  title: trimmedString(2, 160, 'Title'),
  category: z.enum([
    'basic-computing',
    'microsoft-office',
    'software-training',
    'internet-services',
    'other'
  ]),
  summary: trimmedString(10, 400, 'Summary'),
  description: z.string().trim().max(8000).default(''),
  level: z.string().trim().max(80).optional().nullable(),
  duration: z.string().trim().max(120).optional().nullable(),
  price: z.union([z.coerce.number().min(0).max(10_000_000), z.null()]).optional(),
  currency: z.string().trim().length(3).toUpperCase().default('PGK'),
  schedule: z.string().trim().max(160).optional().nullable(),
  delivery_mode: z.string().trim().max(120).optional().nullable(),
  published: booleanField,
  sort_order: sortOrderField
});

export const courseUpdateSchema = courseInputSchema.partial();

/* -------------------------------- projects -------------------------------- */
export const projectInputSchema = z.object({
  slug: slugSchema,
  title: trimmedString(2, 180, 'Title'),
  category: z.enum(['business', 'ict', 'training']),
  client_name: z.string().trim().max(180).optional().nullable(),
  summary: trimmedString(10, 400, 'Summary'),
  description: z.string().trim().max(10000).default(''),
  completed_at: optionalPastOrFutureDateSchema,
  featured: booleanField,
  published: booleanField,
  is_sample: booleanField,
  sort_order: sortOrderField
});

export const projectUpdateSchema = projectInputSchema.partial();

export const projectImageInputSchema = z.object({
  image_url: z.string().trim().url('Enter a valid image URL.').max(1000),
  alt_text: z.string().trim().max(200).default(''),
  sort_order: sortOrderField
});

/* -------------------------------- products -------------------------------- */
export const productInputSchema = z.object({
  sku: z.string().trim().min(2).max(60),
  slug: slugSchema,
  name: trimmedString(2, 180, 'Name'),
  category: z.string().trim().min(2).max(80).default('General'),
  description: z.string().trim().max(6000).default(''),
  price: z.union([z.coerce.number().min(0).max(100_000_000), z.null()]).optional(),
  currency: z.string().trim().length(3).toUpperCase().default('PGK'),
  stock_quantity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).max(1_000_000).optional(),
  track_stock: booleanField,
  image_url: optionalUrl,
  published: booleanField,
  is_sample: booleanField,
  sort_order: sortOrderField
});

export const productUpdateSchema = productInputSchema.partial();

/* ------------------------------ staff profiles ----------------------------- */
export const staffProfileInputSchema = z.object({
  full_name: trimmedString(2, 160, 'Full name'),
  title: trimmedString(2, 160, 'Title'),
  bio: z.string().trim().max(3000).default(''),
  photo_url: optionalUrl,
  email: z.union([emailSchema, z.literal('')]).optional().transform((v) => (v ? v : null)),
  phone: optionalPhoneSchema,
  is_public: booleanField,
  sort_order: sortOrderField
});

export const staffProfileUpdateSchema = staffProfileInputSchema.partial();

/* ------------------------- quote / contact workflows ----------------------- */
export const quoteUpdateSchema = z.object({
  status: quoteStatusSchema.optional(),
  internal_notes: z
    .union([z.string().trim().max(4000), z.literal(''), z.null()])
    .optional()
    .transform((value) => (value ? value : null)),
  assigned_to: z.union([z.string().uuid(), z.null()]).optional()
});

export const quoteStatusUpdateSchema = z.object({ status: quoteStatusSchema });

export const contactUpdateSchema = z.object({
  status: contactStatusSchema.optional(),
  internal_notes: z
    .union([z.string().trim().max(4000), z.literal(''), z.null()])
    .optional()
    .transform((value) => (value ? value : null))
});

export const registrationUpdateSchema = z.object({
  status: registrationStatusSchema.optional(),
  internal_notes: z
    .union([z.string().trim().max(4000), z.literal(''), z.null()])
    .optional()
    .transform((value) => (value ? value : null))
});

/* --------------------------------- settings -------------------------------- */
export const settingKeySchema = z.enum(['company_profile', 'homepage']);

export const companyProfileSettingSchema = z.object({
  name: trimmedString(2, 160, 'Company name'),
  shortName: trimmedString(1, 40, 'Short name'),
  tagline: trimmedString(2, 200, 'Tagline'),
  email: emailSchema,
  phone: trimmedString(5, 40, 'Phone'),
  phoneHref: z
    .string()
    .trim()
    .min(5)
    .max(30)
    .regex(/^[0-9+()\s.-]+$/, 'Enter a valid phone link.'),
  location: trimmedString(5, 400, 'Location'),
  postalAddress: trimmedString(5, 400, 'Postal address'),
  registrationNumber: trimmedString(2, 80, 'Registration number'),
  tin: trimmedString(2, 80, 'TIN')
});

export const homepageSettingSchema = z.object({
  heroEyebrow: trimmedString(2, 160, 'Hero eyebrow'),
  heroTitle: trimmedString(5, 200, 'Hero title'),
  heroDescription: trimmedString(20, 600, 'Hero description'),
  heroPrimaryCta: trimmedString(2, 60, 'Primary button label'),
  heroSecondaryCta: trimmedString(2, 60, 'Secondary button label'),
  supportingNote: trimmedString(2, 200, 'Supporting note')
});

export const settingUpdateSchema = z.object({
  value: z.record(z.unknown()),
  description: z.string().trim().max(300).optional()
});

export const settingValueSchemas = {
  company_profile: companyProfileSettingSchema,
  homepage: homepageSettingSchema
};

/* -------------------------------- users ----------------------------------- */
export const userRolesUpdateSchema = z.object({
  roles: z
    .array(z.enum(['admin', 'staff']))
    .max(2)
    .transform((roles) => [...new Set(roles)])
});

export const uploadPurposeSchema = z.enum(['projects', 'products', 'staff']);

export const productStockUpdateSchema = z.object({
  stock_quantity: z.coerce.number().int().min(0).max(1_000_000),
  track_stock: z.boolean().optional()
});

export const projectIdParamSchema = z.object({
  projectId: z.string().uuid('Invalid project identifier.')
});

export const projectImageParamSchema = z.object({
  projectId: z.string().uuid('Invalid project identifier.'),
  imageId: z.string().uuid('Invalid image identifier.')
});

export const exportEntitySchema = z.enum([
  'quotes',
  'contacts',
  'registrations',
  'products',
  'projects',
  'courses',
  'services',
  'activity-logs'
]);
