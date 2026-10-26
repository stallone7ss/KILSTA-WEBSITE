import { supabase } from './supabase';

const configured = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configured || (import.meta.env.DEV ? 'http://localhost:3000/api/v1' : '/api/v1')
).replace(/\/$/, '');

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export function validationIssues(error: unknown): ValidationIssue[] {
  if (error instanceof ApiError && Array.isArray(error.details)) {
    return (error.details as ValidationIssue[]).filter(
      (item) => item && typeof item.message === 'string'
    );
  }
  return [];
}

export type QueryValue = string | number | boolean | undefined | null;

export function buildQuery(params: Record<string, QueryValue> = {}): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function accessToken(explicit?: string): Promise<string | null> {
  if (explicit) return explicit;
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  token?: string;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiEnvelope<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };

  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  if (options.auth) {
    const token = await accessToken(options.token);
    if (!token) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in to continue.');
    }
    headers.Authorization = `Bearer ${token}`;
  } else if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'We could not reach the service. Please check your connection and try again.'
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok || !payload?.success) {
    const error = payload?.error as
      | { code?: string; message?: string; details?: unknown }
      | undefined;
    throw new ApiError(
      response.status,
      error?.code ?? 'REQUEST_FAILED',
      error?.message ?? 'The request could not be completed.',
      error?.details
    );
  }

  return payload as ApiEnvelope<T>;
}

export async function apiGet<T>(
  path: string,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<ApiEnvelope<T>> {
  return apiRequest<T>(path, { ...options, method: 'GET' });
}

export async function apiSend<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<ApiEnvelope<T>> {
  return apiRequest<T>(path, { ...options, method, body });
}

/** Upload a single image to the protected media endpoint. */
export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const token = await accessToken();
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in to upload files.');

  const body = new FormData();
  body.append('file', file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      body
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'The image could not be uploaded.');
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'UPLOAD_FAILED',
      payload?.error?.message ?? 'The image could not be uploaded.'
    );
  }
  return payload.data as T;
}

/** Download a protected CSV export as a browser file. */
export async function downloadCsv(path: string, fallbackName: string): Promise<void> {
  const token = await accessToken();
  if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'Please sign in to export data.');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    let message = 'The export could not be generated.';
    try {
      const payload = await response.json();
      message = payload?.error?.message ?? message;
    } catch {
      // Ignore non-JSON failures.
    }
    throw new ApiError(response.status, 'EXPORT_FAILED', message);
  }

  const disposition = response.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackName;
  const blob = await response.blob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
