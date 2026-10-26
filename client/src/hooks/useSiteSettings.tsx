import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { COMPANY } from '../lib/company';
import { getSiteSettings } from '../services/content';
import type { CompanyProfile, HomepageCopy } from '../types';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: COMPANY.name,
  shortName: COMPANY.shortName,
  tagline: COMPANY.tagline,
  email: COMPANY.email,
  phone: COMPANY.phone,
  phoneHref: COMPANY.phoneHref,
  location: COMPANY.location,
  postalAddress: COMPANY.postalAddress,
  registrationNumber: COMPANY.registrationNumber,
  tin: COMPANY.tin
};

export const DEFAULT_HOMEPAGE: HomepageCopy = {
  heroEyebrow: 'Business & ICT consultants · Alotau, Milne Bay Province',
  heroTitle: 'Clear thinking. Practical systems. Stronger organisations.',
  heroDescription:
    'KILSTA helps individuals, businesses, institutions and communities in Papua New Guinea strengthen their operations through dependable business advisory, ICT services and practical training.',
  heroPrimaryCta: 'Request a quote',
  heroSecondaryCta: 'Explore our services',
  supportingNote: 'Registered in Papua New Guinea · Registration 6-129295384'
};

const COMPANY_KEYS: Array<keyof CompanyProfile> = [
  'name',
  'shortName',
  'tagline',
  'email',
  'phone',
  'phoneHref',
  'location',
  'postalAddress',
  'registrationNumber',
  'tin'
];

const HOMEPAGE_KEYS: Array<keyof HomepageCopy> = [
  'heroEyebrow',
  'heroTitle',
  'heroDescription',
  'heroPrimaryCta',
  'heroSecondaryCta',
  'supportingNote'
];

function mergeRecord<T extends object>(
  fallback: T,
  source: T | null,
  keys: Array<keyof T>
): T {
  const merged: T = { ...fallback };
  if (!source) return merged;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key as string];
    if (typeof value === 'string' && value.trim()) {
      merged[key] = value as T[keyof T];
    }
  }
  return merged;
}

interface SiteSettingsContextValue {
  company: CompanyProfile;
  homepage: HomepageCopy;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [homepage, setHomepage] = useState<HomepageCopy>(DEFAULT_HOMEPAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getSiteSettings(controller.signal)
      .then((settings) => {
        if (!active) return;
        setCompany(mergeRecord(DEFAULT_COMPANY, settings.company_profile, COMPANY_KEYS));
        setHomepage(mergeRecord(DEFAULT_HOMEPAGE, settings.homepage, HOMEPAGE_KEYS));
      })
      .catch(() => {
        // The bundled defaults are accurate company details, so the public site
        // remains usable if the API is temporarily unavailable.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const value = useMemo(
    () => ({ company, homepage, loading }),
    [company, homepage, loading]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsContextValue {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return context;
}
