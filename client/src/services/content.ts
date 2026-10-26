import { apiGet, buildQuery } from '../lib/api';
import type {
  Course,
  Product,
  Project,
  Service,
  SiteSettings,
  StaffProfile
} from '../types';

export async function getSiteSettings(signal?: AbortSignal): Promise<SiteSettings> {
  const response = await apiGet<SiteSettings>('/site', { signal });
  return response.data;
}

export async function listServices(options: {
  category?: 'business' | 'ict' | 'training';
  featured?: boolean;
  signal?: AbortSignal;
} = {}): Promise<Service[]> {
  const query = buildQuery({ category: options.category, featured: options.featured });
  const response = await apiGet<Service[]>(`/services${query}`, { signal: options.signal });
  return response.data;
}

export async function getService(slug: string, signal?: AbortSignal): Promise<Service> {
  const response = await apiGet<Service>(`/services/${encodeURIComponent(slug)}`, { signal });
  return response.data;
}

export async function listCourses(signal?: AbortSignal): Promise<Course[]> {
  const response = await apiGet<Course[]>('/courses', { signal });
  return response.data;
}

export async function getCourse(slug: string, signal?: AbortSignal): Promise<Course> {
  const response = await apiGet<Course>(`/courses/${encodeURIComponent(slug)}`, { signal });
  return response.data;
}

export async function listProjects(
  options: { category?: 'business' | 'ict' | 'training'; signal?: AbortSignal } = {}
): Promise<Project[]> {
  const query = buildQuery({ category: options.category });
  const response = await apiGet<Project[]>(`/projects${query}`, { signal: options.signal });
  return response.data;
}

export async function getProject(slug: string, signal?: AbortSignal): Promise<Project> {
  const response = await apiGet<Project>(`/projects/${encodeURIComponent(slug)}`, { signal });
  return response.data;
}

export async function listProducts(
  options: { category?: string; search?: string; signal?: AbortSignal } = {}
): Promise<Product[]> {
  const query = buildQuery({ category: options.category, search: options.search });
  const response = await apiGet<Product[]>(`/products${query}`, { signal: options.signal });
  return response.data;
}

export async function listStaff(signal?: AbortSignal): Promise<StaffProfile[]> {
  const response = await apiGet<StaffProfile[]>('/staff', { signal });
  return response.data;
}
