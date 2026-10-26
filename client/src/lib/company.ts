export const COMPANY = {
  name: 'KILSTA Business & ICT Consultants',
  shortName: 'KILSTA',
  tagline: 'Business and ICT solutions for Papua New Guinea',
  email: 'kilsta2023@gmail.com',
  phone: '+675 82545274',
  phoneHref: '+67582545274',
  location:
    'Gumini Village, Huhu LLG, Alotau District, Milne Bay Province, Papua New Guinea',
  postalAddress: 'P.O. Box 424, Alotau, Milne Bay Province, Papua New Guinea',
  registrationNumber: '6-129295384',
  tin: '502603269',
  mapsQuery: 'Alotau, Milne Bay Province, Papua New Guinea'
} as const;

const defaultSiteUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL?.trim() || defaultSiteUrl
).replace(/\/$/, '');

export const SERVICE_CATEGORIES = [
  { value: 'business', label: 'Business services' },
  { value: 'ict', label: 'ICT services' },
  { value: 'training', label: 'ICT training' }
] as const;

export const COURSE_CATEGORY_LABELS: Record<string, string> = {
  'basic-computing': 'Basic computing',
  'microsoft-office': 'Microsoft Office',
  'software-training': 'Software training',
  'internet-services': 'Internet services',
  other: 'Other'
};

export const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/services/business', label: 'Business services' },
  { to: '/services/ict', label: 'ICT services' },
  { to: '/training', label: 'Training' },
  { to: '/projects', label: 'Projects' },
  { to: '/products', label: 'Products' },
  { to: '/contact', label: 'Contact' }
] as const;
