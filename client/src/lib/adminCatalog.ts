import type { CatalogResource } from '../services/admin';
import { COURSE_CATEGORY_LABELS, SERVICE_CATEGORIES } from './company';

export type CatalogFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'date'
  | 'features'
  | 'image';

export interface CatalogFormField {
  name: string;
  label: string;
  type: CatalogFieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  hint?: string;
  placeholder?: string;
  rows?: number;
  step?: string;
  min?: string;
  full?: boolean;
  nullable?: boolean;
  validation?: 'slug' | 'url' | 'email' | 'phone' | 'currency';
  upload?: boolean;
}

const SERVICE_OPTIONS = SERVICE_CATEGORIES.map((entry) => ({
  value: entry.value,
  label: entry.label
}));

const COURSE_OPTIONS = Object.entries(COURSE_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label
}));

const commonSort: CatalogFormField = {
  name: 'sort_order',
  label: 'Sort order',
  type: 'number',
  min: '0',
  hint: 'Lower numbers appear first.'
};

export const CATALOG_FIELDS: Record<CatalogResource, CatalogFormField[]> = {
  services: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, validation: 'slug', hint: 'Lowercase letters, numbers and hyphens.' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: SERVICE_OPTIONS },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true, rows: 2, full: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 5, full: true },
    { name: 'features', label: 'Feature list', type: 'features', full: true, hint: 'One feature per line.' },
    { name: 'icon', label: 'Icon key (optional)', type: 'text', hint: 'Short internal key, for example “chart”.' },
    {
      name: 'image_url',
      label: 'Image URL (optional)',
      type: 'image',
      validation: 'url',
      full: true
    },
    { name: 'featured', label: 'Featured on the website', type: 'checkbox' },
    { name: 'published', label: 'Published', type: 'checkbox' },
    commonSort
  ],
  courses: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, validation: 'slug' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: COURSE_OPTIONS },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true, rows: 2, full: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 5, full: true },
    { name: 'level', label: 'Level', type: 'text', nullable: true },
    { name: 'duration', label: 'Duration', type: 'text', nullable: true },
    {
      name: 'price',
      label: 'Price (PGK)',
      type: 'number',
      nullable: true,
      step: '0.01',
      min: '0',
      hint: 'Leave blank to show “price on request”.'
    },
    { name: 'currency', label: 'Currency', type: 'text', required: true, validation: 'currency' },
    { name: 'schedule', label: 'Schedule', type: 'text', nullable: true },
    { name: 'delivery_mode', label: 'Delivery mode', type: 'text', nullable: true },
    { name: 'published', label: 'Published', type: 'checkbox' },
    commonSort
  ],
  projects: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, validation: 'slug' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: SERVICE_OPTIONS },
    { name: 'client_name', label: 'Client name (optional)', type: 'text', nullable: true },
    { name: 'summary', label: 'Summary', type: 'textarea', required: true, rows: 2, full: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 6, full: true },
    { name: 'completed_at', label: 'Completion date', type: 'date' },
    { name: 'featured', label: 'Featured on the website', type: 'checkbox' },
    { name: 'published', label: 'Published', type: 'checkbox' },
    {
      name: 'is_sample',
      label: 'Sample record (exclude from public pages)',
      type: 'checkbox',
      hint: 'Keep sample data hidden until it has been replaced with verified information.'
    },
    commonSort
  ],
  products: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true, validation: 'slug' },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4, full: true },
    {
      name: 'price',
      label: 'Price (PGK)',
      type: 'number',
      nullable: true,
      step: '0.01',
      min: '0',
      hint: 'Leave blank to show “price on request”.'
    },
    { name: 'currency', label: 'Currency', type: 'text', required: true, validation: 'currency' },
    { name: 'stock_quantity', label: 'Stock quantity', type: 'number', required: true, min: '0' },
    {
      name: 'low_stock_threshold',
      label: 'Low-stock threshold',
      type: 'number',
      required: true,
      min: '0'
    },
    { name: 'track_stock', label: 'Track stock', type: 'checkbox' },
    {
      name: 'image_url',
      label: 'Product image',
      type: 'image',
      validation: 'url',
      full: true,
      upload: true
    },
    { name: 'published', label: 'Published', type: 'checkbox' },
    { name: 'is_sample', label: 'Sample record (exclude from public pages)', type: 'checkbox' },
    commonSort
  ],
  'staff-profiles': [
    { name: 'full_name', label: 'Full name', type: 'text', required: true },
    { name: 'title', label: 'Role or title', type: 'text', required: true },
    { name: 'bio', label: 'Short biography', type: 'textarea', rows: 5, full: true },
    {
      name: 'photo_url',
      label: 'Photo',
      type: 'image',
      validation: 'url',
      full: true,
      upload: true
    },
    { name: 'email', label: 'Contact email (optional)', type: 'text', validation: 'email', nullable: true },
    { name: 'phone', label: 'Contact phone (optional)', type: 'text', validation: 'phone', nullable: true },
    { name: 'is_public', label: 'Show on the public website', type: 'checkbox' },
    commonSort
  ]
};

export type CatalogFormValues = Record<string, string | boolean>;

const SLUG_SOURCES: Partial<Record<CatalogResource, string>> = {
  services: 'title',
  courses: 'title',
  projects: 'title',
  products: 'name',
  'staff-profiles': 'full_name'
};

export function slugSource(resource: CatalogResource): string | undefined {
  return SLUG_SOURCES[resource];
}

export function emptyCatalogValues(resource: CatalogResource): CatalogFormValues {
  const values: CatalogFormValues = {};
  for (const field of CATALOG_FIELDS[resource]) {
    if (field.type === 'checkbox') {
      values[field.name] = false;
    } else if (field.type === 'number') {
      values[field.name] = field.name === 'sort_order' ? '0' : field.name === 'low_stock_threshold' ? '5' : '0';
    } else if (field.name === 'currency') {
      values[field.name] = 'PGK';
    } else if (field.name === 'category' && field.options?.length) {
      values[field.name] = field.options[0].value;
    } else if (field.name === 'category' && resource === 'products') {
      values[field.name] = 'General';
    } else {
      values[field.name] = '';
    }
  }
  if (resource === 'products') values.track_stock = true;
  return values;
}

export function catalogValuesFromRow(
  resource: CatalogResource,
  row: Record<string, unknown>
): CatalogFormValues {
  const values = emptyCatalogValues(resource);
  for (const field of CATALOG_FIELDS[resource]) {
    const raw = row[field.name];
    if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
    } else if (field.type === 'features') {
      values[field.name] = Array.isArray(raw) ? raw.join('\n') : '';
    } else if (raw === null || raw === undefined) {
      values[field.name] = field.type === 'number' ? '' : '';
    } else {
      values[field.name] = String(raw);
    }
  }
  return values;
}

export function catalogPayloadFromValues(
  resource: CatalogResource,
  values: CatalogFormValues
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of CATALOG_FIELDS[resource]) {
    const raw = values[field.name];

    if (field.type === 'checkbox') {
      payload[field.name] = Boolean(raw);
      continue;
    }

    const text = typeof raw === 'string' ? raw.trim() : '';

    if (field.type === 'features') {
      payload[field.name] = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      continue;
    }

    if (field.type === 'number') {
      if (text === '') {
        if (field.nullable) payload[field.name] = null;
        continue;
      }
      payload[field.name] = Number(text);
      continue;
    }

    if (field.type === 'date') {
      if (text === '') continue;
      payload[field.name] = text;
      continue;
    }

    if (text === '' && field.nullable) {
      payload[field.name] = null;
      continue;
    }

    payload[field.name] = field.validation === 'currency' ? text.toUpperCase() : text;
  }
  return payload;
}

export function validateCatalogValues(
  resource: CatalogResource,
  values: CatalogFormValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of CATALOG_FIELDS[resource]) {
    const raw = values[field.name];
    const text = typeof raw === 'string' ? raw.trim() : '';
    if (field.required && text === '' && field.type !== 'checkbox') {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }
    if (!text) continue;

    switch (field.validation) {
      case 'slug':
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) {
          errors[field.name] = 'Use lowercase letters, numbers and hyphens only.';
        }
        break;
      case 'url':
        try {
          const parsed = new URL(text);
          if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid');
        } catch {
          errors[field.name] = 'Enter a full http:// or https:// URL.';
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
          errors[field.name] = 'Enter a valid email address.';
        }
        break;
      case 'phone':
        if (!/^[0-9+()\s.-]{7,30}$/.test(text)) {
          errors[field.name] = 'Enter a valid phone number.';
        }
        break;
      case 'currency':
        if (text.length !== 3) errors[field.name] = 'Use a three-letter currency code.';
        break;
      default:
        break;
    }
  }

  return errors;
}

export function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}
