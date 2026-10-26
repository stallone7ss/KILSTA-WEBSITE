import { useEffect, useMemo, useState } from 'react';
import { Building2, Save, Sparkles } from 'lucide-react';
import {
  AdminPageHeader,
  Detail,
  ReadOnlyNote
} from '../../components/admin/AdminUi';
import { ErrorBlock, LoadingBlock } from '../../components/ui/Feedback';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Form';
import { Badge } from '../../components/ui/Badge';
import { ApiError, validationIssues } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { DEFAULT_COMPANY, DEFAULT_HOMEPAGE } from '../../hooks/useSiteSettings';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import { listSettings, updateSetting } from '../../services/admin';
import type { CompanyProfile, HomepageCopy, SiteSettingRow } from '../../types';

type Tab = 'company_profile' | 'homepage';

function mergeSetting<T extends object>(
  fallback: T,
  source: Record<string, unknown> | null
): T {
  const merged = { ...fallback };
  if (!source) return merged;
  for (const key of Object.keys(merged) as Array<keyof T>) {
    const value = source[key as string];
    if (typeof value === 'string' && value.trim()) merged[key] = value as T[keyof T];
  }
  return merged;
}

function SettingMeta({ setting }: { setting?: SiteSettingRow }) {
  if (!setting) {
    return <Badge tone="neutral">Using bundled defaults</Badge>;
  }
  return (
    <span className="text-[11px] text-slate-500">
      Last saved {formatDateTime(setting.updated_at)}
    </span>
  );
}

export function AdminSettingsPage() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useApi<SiteSettingRow[]>(
    () => listSettings(),
    []
  );
  const [tab, setTab] = useState<Tab>('company_profile');
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [homepage, setHomepage] = useState<HomepageCopy>(DEFAULT_HOMEPAGE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const settings = useMemo(() => {
    const map = new Map((data ?? []).map((entry) => [entry.key, entry]));
    return {
      company: map.get('company_profile'),
      homepage: map.get('homepage')
    };
  }, [data]);

  useEffect(() => {
    if (!data) return;
    setCompany(
      mergeSetting(DEFAULT_COMPANY, settings.company?.value ?? null)
    );
    setHomepage(
      mergeSetting(DEFAULT_HOMEPAGE, settings.homepage?.value ?? null)
    );
  }, [data, settings]);

  const save = async (key: Tab) => {
    setErrors({});
    setSaving(true);
    try {
      const saved = await updateSetting(
        key,
        (key === 'company_profile' ? company : homepage) as unknown as Record<string, unknown>
      );
      setData((current) => {
        const rows = current ?? [];
        const existing = rows.findIndex((row) => row.key === key);
        if (existing === -1) return [...rows, saved];
        const next = [...rows];
        next[existing] = saved;
        return next;
      });
      toast.success('Settings saved', 'Public pages use these values the next time they load.');
    } catch (caught) {
      const issues = validationIssues(caught);
      if (issues.length > 0) {
        const mapped: Record<string, string> = {};
        for (const issue of issues) {
          mapped[issue.path.split('.').pop() ?? issue.path] = issue.message;
        }
        setErrors(mapped);
        toast.error('Settings not saved', 'Please correct the highlighted fields.');
      } else {
        toast.error(
          'Settings not saved',
          caught instanceof ApiError ? caught.message : 'Please try again.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Settings & content"
        description="Maintain the company details and homepage wording used across the public website. Saved values override the bundled defaults."
        actions={
          <Button variant="outline" small onClick={reload}>
            Refresh
          </Button>
        }
      />

      <ReadOnlyNote>
        These settings control public wording only. They do not change authentication, email
        delivery, hosting or database configuration. Only administrators can edit them.
      </ReadOnlyNote>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab('company_profile')}
          className={
            tab === 'company_profile'
              ? 'btn-primary btn-sm'
              : 'btn-outline btn-sm'
          }
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Company profile
        </button>
        <button
          type="button"
          onClick={() => setTab('homepage')}
          className={tab === 'homepage' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Homepage copy
        </button>
      </div>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingBlock label="Loading settings" rows={3} />
      ) : tab === 'company_profile' ? (
        <form
          className="card-surface p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            void save('company_profile');
          }}
          noValidate
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Company profile</h2>
              <p className="mt-1 text-sm text-slate-500">
                Contact details, location and registration information shown in the header, footer
                and contact pages.
              </p>
            </div>
            <SettingMeta setting={settings.company} />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input
              label="Company name"
              required
              value={company.name}
              error={errors.name}
              onChange={(event) => setCompany({ ...company, name: event.target.value })}
            />
            <Input
              label="Short name"
              required
              value={company.shortName}
              error={errors.shortName}
              onChange={(event) => setCompany({ ...company, shortName: event.target.value })}
            />
            <Input
              label="Tagline"
              required
              containerClassName="sm:col-span-2"
              value={company.tagline}
              error={errors.tagline}
              onChange={(event) => setCompany({ ...company, tagline: event.target.value })}
            />
            <Input
              label="Email address"
              type="email"
              required
              value={company.email}
              error={errors.email}
              onChange={(event) => setCompany({ ...company, email: event.target.value })}
            />
            <Input
              label="Phone (display)"
              required
              value={company.phone}
              error={errors.phone}
              onChange={(event) => setCompany({ ...company, phone: event.target.value })}
            />
            <Input
              label="Phone link"
              required
              hint="Digits and + ( ) spaces, dots or hyphens only, for example +67582545274."
              value={company.phoneHref}
              error={errors.phoneHref}
              onChange={(event) => setCompany({ ...company, phoneHref: event.target.value })}
            />
            <Input
              label="Registration number"
              required
              value={company.registrationNumber}
              error={errors.registrationNumber}
              onChange={(event) =>
                setCompany({ ...company, registrationNumber: event.target.value })
              }
            />
            <Input
              label="TIN"
              required
              value={company.tin}
              error={errors.tin}
              onChange={(event) => setCompany({ ...company, tin: event.target.value })}
            />
            <Input
              label="Location"
              required
              containerClassName="sm:col-span-2"
              value={company.location}
              error={errors.location}
              onChange={(event) => setCompany({ ...company, location: event.target.value })}
            />
            <Input
              label="Postal address"
              required
              containerClassName="sm:col-span-2"
              value={company.postalAddress}
              error={errors.postalAddress}
              onChange={(event) => setCompany({ ...company, postalAddress: event.target.value })}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              Verify legal and contact details with the business before saving.
            </p>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save company profile
            </Button>
          </div>
        </form>
      ) : (
        <form
          className="card-surface p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            void save('homepage');
          }}
          noValidate
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-navy-900">Homepage copy</h2>
              <p className="mt-1 text-sm text-slate-500">
                The hero section and its calls to action. Keep claims factual and avoid guarantees
                that the business cannot support.
              </p>
            </div>
            <SettingMeta setting={settings.homepage} />
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Input
              label="Hero eyebrow"
              required
              containerClassName="sm:col-span-2"
              value={homepage.heroEyebrow}
              error={errors.heroEyebrow}
              onChange={(event) => setHomepage({ ...homepage, heroEyebrow: event.target.value })}
            />
            <Input
              label="Hero title"
              required
              containerClassName="sm:col-span-2"
              value={homepage.heroTitle}
              error={errors.heroTitle}
              onChange={(event) => setHomepage({ ...homepage, heroTitle: event.target.value })}
            />
            <Textarea
              label="Hero description"
              required
              rows={4}
              containerClassName="sm:col-span-2"
              value={homepage.heroDescription}
              error={errors.heroDescription}
              onChange={(event) =>
                setHomepage({ ...homepage, heroDescription: event.target.value })
              }
            />
            <Input
              label="Primary button label"
              required
              value={homepage.heroPrimaryCta}
              error={errors.heroPrimaryCta}
              onChange={(event) =>
                setHomepage({ ...homepage, heroPrimaryCta: event.target.value })
              }
            />
            <Input
              label="Secondary button label"
              required
              value={homepage.heroSecondaryCta}
              error={errors.heroSecondaryCta}
              onChange={(event) =>
                setHomepage({ ...homepage, heroSecondaryCta: event.target.value })
              }
            />
            <Input
              label="Supporting note"
              required
              containerClassName="sm:col-span-2"
              value={homepage.supportingNote}
              error={errors.supportingNote}
              onChange={(event) =>
                setHomepage({ ...homepage, supportingNote: event.target.value })
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <p className="text-xs leading-5 text-slate-500">
              Button labels change the wording only; the destinations remain fixed.
            </p>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save homepage copy
            </Button>
          </div>
        </form>
      )}

      <div className="mt-6 card-surface p-5">
        <h2 className="text-sm font-semibold text-navy-900">Deployment configuration</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Email delivery, database credentials and allowed origins are configured through server
          environment variables. They are intentionally not editable in this interface.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail label="Public settings keys">company_profile, homepage</Detail>
          <Detail label="Email delivery">
            Configured by the server operator. A “not sent” status in an enquiry means no message was
            delivered by this deployment.
          </Detail>
        </dl>
      </div>
    </>
  );
}
