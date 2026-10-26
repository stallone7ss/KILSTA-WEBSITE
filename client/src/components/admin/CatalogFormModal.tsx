import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ImagePlus, Link2, Loader2, Wand2 } from 'lucide-react';
import { Modal } from '../ui/Overlay';
import { Button } from '../ui/Button';
import { Checkbox, Input, Select, Textarea } from '../ui/Form';
import { Alert } from '../ui/Feedback';
import { useToast } from '../../hooks/useToast';
import { ApiError, validationIssues } from '../../lib/api';
import {
  CATALOG_FIELDS,
  catalogPayloadFromValues,
  catalogValuesFromRow,
  emptyCatalogValues,
  makeSlug,
  slugSource,
  validateCatalogValues,
  type CatalogFormField,
  type CatalogFormValues
} from '../../lib/adminCatalog';
import {
  createCatalogRecord,
  updateCatalogRecord,
  uploadImage,
  type CatalogResource
} from '../../services/admin';

const UPLOAD_PURPOSE: Partial<Record<CatalogResource, 'projects' | 'products' | 'staff'>> = {
  projects: 'projects',
  products: 'products',
  'staff-profiles': 'staff'
};

const RESOURCE_LABELS: Record<CatalogResource, string> = {
  services: 'service',
  courses: 'course',
  projects: 'project',
  products: 'product',
  'staff-profiles': 'public profile'
};

export function CatalogFormModal({
  open,
  resource,
  record,
  onClose,
  onSaved
}: {
  open: boolean;
  resource: CatalogResource;
  record: Record<string, unknown> | null;
  onClose: () => void;
  onSaved: (record: Record<string, unknown>) => void;
}) {
  const toast = useToast();
  const fields = CATALOG_FIELDS[resource];
  const source = slugSource(resource);
  const purpose = UPLOAD_PURPOSE[resource];
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<CatalogFormValues>(() => emptyCatalogValues(resource));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const isEdit = Boolean(record);
  const label = RESOURCE_LABELS[resource];

  useEffect(() => {
    if (!open) return;
    setValues(record ? catalogValuesFromRow(resource, record) : emptyCatalogValues(resource));
    setErrors({});
    setServerError(null);
    setSlugEdited(Boolean(record));
  }, [open, record, resource]);

  const setField = (name: string, value: string | boolean) => {
    setValues((current) => {
      const next = { ...current, [name]: value };

      // Keep the slug in step with the title/name while creating a new record,
      // unless the person has chosen to edit the slug directly.
      if (source && name === source && !slugEdited && !isEdit && typeof value === 'string') {
        next.slug = makeSlug(value);
      }
      return next;
    });
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const generateSlug = () => {
    if (!source) return;
    const raw = values[source];
    const generated = makeSlug(typeof raw === 'string' ? raw : '');
    if (!generated) {
      setErrors((current) => ({
        ...current,
        slug: `Enter a ${source === 'name' ? 'name' : 'title'} before generating a slug.`
      }));
      return;
    }
    setValues((current) => ({ ...current, slug: generated }));
    setSlugEdited(true);
    setErrors((current) => {
      const next = { ...current };
      delete next.slug;
      return next;
    });
  };

  const handleUpload = async (fieldName: string, file: File | undefined) => {
    if (!file || !purpose) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, [fieldName]: 'Choose an image no larger than 5 MB.' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((current) => ({
        ...current,
        [fieldName]: 'Choose a JPEG, PNG or WebP image.'
      }));
      return;
    }
    setUploadingField(fieldName);
    try {
      const uploaded = await uploadImage(file, purpose);
      setField(fieldName, uploaded.url);
      toast.success('Image uploaded', 'Remember to save this record.');
    } catch (caught) {
      toast.error(
        'Upload failed',
        caught instanceof ApiError ? caught.message : 'The image could not be uploaded.'
      );
    } finally {
      setUploadingField(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    setServerError(null);
    const nextErrors = validateCatalogValues(resource, values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setServerError('Please correct the highlighted fields before saving.');
      return;
    }

    setSaving(true);
    try {
      const payload = catalogPayloadFromValues(resource, values);
      const saved =
        record && typeof record.id === 'string'
          ? await updateCatalogRecord<Record<string, unknown>>(resource, record.id, payload)
          : await createCatalogRecord<Record<string, unknown>>(resource, payload);
      toast.success(
        record ? `${capitalize(label)} updated` : `${capitalize(label)} created`,
        record ? 'Your changes have been saved.' : 'The new record is ready for review.'
      );
      onSaved(saved);
      onClose();
    } catch (caught) {
      const issues = validationIssues(caught);
      if (issues.length > 0) {
        const mapped: Record<string, string> = {};
        for (const issue of issues) {
          const key = issue.path.split('.').pop() ?? issue.path;
          mapped[key] = issue.message;
        }
        setErrors(mapped);
        setServerError('The server rejected one or more fields. Please review them below.');
      } else {
        setServerError(
          caught instanceof ApiError
            ? caught.message
            : 'The record could not be saved. Please try again.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const footer = useMemo(
    () => (
      <>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={() => void handleSubmit()} loading={saving}>
          {record ? 'Save changes' : `Create ${label}`}
        </Button>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [saving, record, label, onClose, values, errors, slugEdited]
  );

  return (
    <Modal
      open={open}
      onClose={saving ? () => undefined : onClose}
      title={record ? `Edit ${label}` : `New ${label}`}
      description={
        record
          ? 'Changes are recorded in the activity log.'
          : `New records start unpublished. Review the content before publishing it to the public website.`
      }
      size="xl"
      footer={footer}
    >
      {serverError ? (
        <div className="mb-5">
          <Alert tone="danger" title="Not saved">
            <p>{serverError}</p>
          </Alert>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <CatalogField
            key={field.name}
            field={field}
            resource={resource}
            value={values[field.name]}
            error={errors[field.name]}
            source={source}
            uploading={uploadingField === field.name}
            slugEdited={slugEdited}
            onChange={(value) => {
              if (field.name === 'slug') setSlugEdited(true);
              setField(field.name, value);
            }}
            onGenerateSlug={generateSlug}
            onUpload={(file) => void handleUpload(field.name, file)}
            fileRef={fileRef}
          />
        ))}
      </div>

      {resource === 'staff-profiles' ? (
        <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
          Public profiles appear on the website only when “Show on the public website” is selected.
          Do not publish personal contact details without the person’s consent.
        </p>
      ) : null}

      {resource === 'projects' || resource === 'products' ? (
        <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          Sample records are hidden from public pages. Remove the sample flag only after the content
          has been verified and approved for publication.
        </p>
      ) : null}
    </Modal>
  );
}

function CatalogField({
  field,
  resource,
  value,
  error,
  source,
  uploading,
  slugEdited,
  onChange,
  onGenerateSlug,
  onUpload,
  fileRef
}: {
  field: CatalogFormField;
  resource: CatalogResource;
  value: string | boolean | undefined;
  error?: string;
  source?: string;
  uploading: boolean;
  slugEdited: boolean;
  onChange: (value: string | boolean) => void;
  onGenerateSlug: () => void;
  onUpload: (file: File | undefined) => void;
  fileRef: RefObject<HTMLInputElement>;
}) {
  const containerClass = field.full ? 'sm:col-span-2' : undefined;

  if (field.type === 'checkbox') {
    return (
      <div className={containerClass ? `${containerClass} sm:col-span-2` : 'sm:col-span-2'}>
        <Checkbox
          label={
            <span>
              <span className="font-semibold text-navy-900">{field.label}</span>
              {field.hint ? (
                <span className="mt-0.5 block text-xs leading-5 text-slate-500">{field.hint}</span>
              ) : null}
            </span>
          }
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          error={error}
        />
      </div>
    );
  }

  if (field.type === 'features') {
    return (
      <Textarea
        label={field.label}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        rows={field.rows ?? 4}
        error={error}
        hint={field.hint}
        containerClassName={containerClass ?? 'sm:col-span-2'}
        placeholder={'Example feature one\nExample feature two'}
      />
    );
  }

  if (field.type === 'select') {
    return (
      <Select
        label={field.label}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        hint={field.hint}
        required={field.required}
        containerClassName={containerClass}
      >
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === 'image') {
    const url = typeof value === 'string' ? value : '';
    const uploadEnabled = field.upload && Boolean(UPLOAD_PURPOSE[resource]);
    return (
      <div className={containerClass ?? 'sm:col-span-2'}>
        <Input
          label={field.label}
          value={url}
          onChange={(event) => onChange(event.target.value)}
          error={error}
          hint={field.hint ?? (uploadEnabled ? 'Paste a hosted image URL or upload a file.' : undefined)}
          placeholder="https://…"
          type="url"
        />
        {uploadEnabled ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => onUpload(event.target.files?.[0])}
              aria-label={`Upload ${field.label.toLowerCase()}`}
            />
            <Button
              type="button"
              variant="outline"
              small
              loading={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Upload image
            </Button>
            <span className="text-[11px] text-slate-500">JPEG, PNG or WebP · maximum 5 MB</span>
          </div>
        ) : null}
        {url ? (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <img
              src={url}
              alt="Image preview"
              className="h-20 w-28 rounded-lg border border-slate-200 bg-white object-cover"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <p className="break-all text-[11px] leading-5 text-slate-500">
              <Link2 className="mr-1 inline h-3 w-3" aria-hidden="true" />
              {url}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={field.name === 'slug' ? containerClass : containerClass}>
      <Input
        label={field.label}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        error={error}
        hint={field.hint}
        required={field.required}
        placeholder={field.placeholder}
        step={field.step}
        min={field.min}
        inputMode={field.type === 'number' ? 'decimal' : undefined}
        autoComplete="off"
      />
      {field.name === 'slug' && source ? (
        <button
          type="button"
          onClick={onGenerateSlug}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800"
        >
          <Wand2 className="h-3 w-3" aria-hidden="true" />
          {slugEdited ? 'Regenerate from title' : 'Generate from title'}
        </button>
      ) : null}
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
