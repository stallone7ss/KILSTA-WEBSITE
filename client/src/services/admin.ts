import { apiGet, apiSend, apiUpload, buildQuery } from '../lib/api';
import type { AdminListParams } from '../hooks/useAdminList';
import type {
  ActivityLogRow,
  ContactMessageRow,
  ContactStatus,
  CourseRegistrationRow,
  CourseRow,
  DashboardData,
  ProductRow,
  ProjectRow,
  QuoteRequestRow,
  ServiceRow,
  SiteSettingRow,
  StaffProfileRow
} from '../types';

export type CatalogResource = 'services' | 'courses' | 'projects' | 'products' | 'staff-profiles';

function pagedQuery(params: AdminListParams): string {
  return buildQuery(params as unknown as Record<string, string | number | boolean | undefined>);
}

export async function getDashboard(): Promise<DashboardData> {
  const response = await apiGet<DashboardData>('/admin/dashboard', { auth: true });
  return response.data;
}

/* -------------------------------- quotes ---------------------------------- */

export async function getQuote(id: string): Promise<QuoteRequestRow> {
  const response = await apiGet<QuoteRequestRow>(`/admin/quotes/${id}`, { auth: true });
  return response.data;
}

export async function updateQuote(
  id: string,
  patch: { internal_notes?: string | null; status?: string }
): Promise<QuoteRequestRow> {
  const response = await apiSend<QuoteRequestRow>(`/admin/quotes/${id}`, 'PATCH', patch, {
    auth: true
  });
  return response.data;
}

export async function updateQuoteStatus(id: string, status: string): Promise<QuoteRequestRow> {
  const response = await apiSend<QuoteRequestRow>(
    `/admin/quotes/${id}/status`,
    'PATCH',
    { status },
    { auth: true }
  );
  return response.data;
}

/* ------------------------------- contacts -------------------------------- */

export async function updateContact(
  id: string,
  patch: { status?: ContactStatus; internal_notes?: string | null }
): Promise<ContactMessageRow> {
  const response = await apiSend<ContactMessageRow>(`/admin/contacts/${id}`, 'PATCH', patch, {
    auth: true
  });
  return response.data;
}

/* ------------------------------ registrations ------------------------------ */

export function updateRegistration(
  id: string,
  patch: { status?: string; internal_notes?: string | null }
): Promise<CourseRegistrationRow> {
  return apiSend<CourseRegistrationRow>(`/admin/registrations/${id}`, 'PATCH', patch, {
    auth: true
  }).then((response) => response.data);
}

/* -------------------------------- catalog --------------------------------- */

export function listCatalog<T>(
  resource: CatalogResource,
  params: AdminListParams
): Promise<T[]> {
  return apiGet<T[]>(`/admin/${resource}${pagedQuery(params)}`, { auth: true }).then(
    (response) => response.data
  );
}

export async function createCatalogRecord<T>(
  resource: CatalogResource,
  values: Record<string, unknown>
): Promise<T> {
  const response = await apiSend<T>(`/admin/${resource}`, 'POST', values, { auth: true });
  return response.data;
}

export async function updateCatalogRecord<T>(
  resource: CatalogResource,
  id: string,
  values: Record<string, unknown>
): Promise<T> {
  const response = await apiSend<T>(`/admin/${resource}/${id}`, 'PATCH', values, { auth: true });
  return response.data;
}

export async function deleteCatalogRecord(resource: CatalogResource, id: string): Promise<void> {
  await apiSend(`/admin/${resource}/${id}`, 'DELETE', undefined, { auth: true });
}

export async function updateProductStock(
  id: string,
  values: { stock_quantity: number; track_stock?: boolean }
): Promise<ProductRow> {
  const response = await apiSend<ProductRow>(`/admin/products/${id}/stock`, 'PATCH', values, {
    auth: true
  });
  return response.data;
}

/* --------------------------------- uploads --------------------------------- */

export function uploadImage(
  file: File,
  purpose: 'projects' | 'products' | 'staff'
): Promise<{ url: string; path: string }> {
  return apiUpload<{ url: string; path: string }>(
    `/admin/uploads?purpose=${encodeURIComponent(purpose)}`,
    file
  );
}

/* ------------------------------ project images ----------------------------- */export interface ProjectImageRow {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export function listProjectImages(projectId: string): Promise<ProjectImageRow[]> {
  return apiGet<ProjectImageRow[]>(`/admin/projects/${projectId}/images`, { auth: true }).then(
    (response) => response.data
  );
}

export function addProjectImage(
  projectId: string,
  values: { image_url: string; alt_text: string }
): Promise<ProjectImageRow> {
  return apiSend<ProjectImageRow>(
    `/admin/projects/${projectId}/images`,
    'POST',
    values,
    { auth: true }
  ).then((response) => response.data);
}

export async function deleteProjectImage(projectId: string, imageId: string): Promise<void> {
  await apiSend(`/admin/projects/${projectId}/images/${imageId}`, 'DELETE', undefined, {
    auth: true
  });
}

/* -------------------------------- settings -------------------------------- */

export async function listSettings(): Promise<SiteSettingRow[]> {
  const response = await apiGet<SiteSettingRow[]>('/admin/settings', { auth: true });
  return response.data;
}

export async function updateSetting(
  key: 'company_profile' | 'homepage',
  value: Record<string, unknown>,
  description?: string
): Promise<SiteSettingRow> {
  const response = await apiSend<SiteSettingRow>(`/admin/settings/${key}`, 'PUT', {
    value,
    description
  }, { auth: true });
  return response.data;
}

/* ---------------------------------- users ---------------------------------- */

export function updateUserRoles(
  id: string,
  roles: Array<'admin' | 'staff'>
): Promise<{ id: string; roles: Array<'admin' | 'staff'> }> {
  return apiSend<{ id: string; roles: Array<'admin' | 'staff'> }>(
    `/admin/users/${id}/roles`,
    'PUT',
    { roles },
    { auth: true }
  ).then((response) => response.data);
}

/* -------------------------------- exports --------------------------------- */

export function exportPath(entity: string, params: AdminListParams): string {
  return `/admin/exports/${entity}${pagedQuery(params)}`;
}

/* ------------------------------- row helpers ------------------------------- */

export type AdminRow =
  | QuoteRequestRow
  | CourseRegistrationRow
  | ServiceRow
  | CourseRow
  | ProjectRow
  | ProductRow
  | StaffProfileRow
  | ActivityLogRow;
