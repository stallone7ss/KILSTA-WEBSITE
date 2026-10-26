import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '../types/database.types';
import { notFound } from '../utils/errors';
import { assertNoDbError } from '../utils/asyncHandler';
import { buildIlikeOrFilter } from '../utils/csv';
import type { Logger } from '../utils/logger';

export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_request';

export interface PublicService {
  id: string;
  slug: string;
  title: string;
  category: 'business' | 'ict' | 'training';
  summary: string;
  description: string;
  features: string[];
  icon: string | null;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
}

export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  category: Tables<'courses'>['category'];
  summary: string;
  description: string;
  level: string | null;
  duration: string | null;
  price: number | null;
  currency: string;
  schedule: string | null;
  delivery_mode: string | null;
  sort_order: number;
}

export interface PublicProjectImage {
  id: string;
  image_url: string;
  alt_text: string;
}

export interface PublicProject {
  id: string;
  slug: string;
  title: string;
  category: 'business' | 'ict' | 'training';
  summary: string;
  description: string;
  completed_at: string | null;
  featured: boolean;
  sort_order: number;
  images: PublicProjectImage[];
}

export interface PublicProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  currency: string;
  image_url: string | null;
  availability: Availability;
  sort_order: number;
}

export interface PublicStaffProfile {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  photo_url: string | null;
  sort_order: number;
}

export interface PublicSiteSettings {
  company_profile: Record<string, unknown> | null;
  homepage: Record<string, unknown> | null;
}

const mapService = (row: Tables<'services'>): PublicService => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  category: row.category,
  summary: row.summary,
  description: row.description,
  features: row.features ?? [],
  icon: row.icon,
  image_url: row.image_url,
  featured: row.featured,
  sort_order: row.sort_order
});

const mapCourse = (row: Tables<'courses'>): PublicCourse => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  category: row.category,
  summary: row.summary,
  description: row.description,
  level: row.level,
  duration: row.duration,
  price: row.price === null ? null : Number(row.price),
  currency: row.currency,
  schedule: row.schedule,
  delivery_mode: row.delivery_mode,
  sort_order: row.sort_order
});

const availabilityFor = (row: Tables<'products'>): Availability => {
  if (!row.track_stock) return 'on_request';
  if (row.stock_quantity <= 0) return 'out_of_stock';
  if (row.stock_quantity <= row.low_stock_threshold) return 'low_stock';
  return 'in_stock';
};

const mapProduct = (row: Tables<'products'>): PublicProduct => ({
  id: row.id,
  slug: row.slug,
  sku: row.sku,
  name: row.name,
  category: row.category,
  description: row.description,
  price: row.price === null ? null : Number(row.price),
  currency: row.currency,
  image_url: row.image_url,
  availability: availabilityFor(row),
  sort_order: row.sort_order
});

export interface ContentService {
  listServices(category?: 'business' | 'ict' | 'training', featured?: boolean): Promise<PublicService[]>;
  getServiceBySlug(slug: string): Promise<PublicService>;
  listCourses(): Promise<PublicCourse[]>;
  getCourseBySlug(slug: string): Promise<PublicCourse>;
  listProjects(category?: 'business' | 'ict' | 'training', featured?: boolean): Promise<PublicProject[]>;
  getProjectBySlug(slug: string): Promise<PublicProject>;
  listProducts(options?: { category?: string; search?: string }): Promise<PublicProduct[]>;
  getProductBySlug(slug: string): Promise<PublicProduct>;
  listStaff(): Promise<PublicStaffProfile[]>;
  getPublicSettings(): Promise<PublicSiteSettings>;
}

export function createContentService(
  getDb: () => SupabaseClient<Database>,
  logger: Logger
): ContentService {
  return {
    async listServices(category, featured) {
      const db = getDb();
      let query = db.from('services').select('*').eq('published', true);
      if (category) query = query.eq('category', category);
      if (featured) query = query.eq('featured', true);

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });
      assertNoDbError(error, logger, 'content.listServices');
      return (data ?? []).map(mapService);
    },

    async getServiceBySlug(slug) {
      const { data, error } = await getDb()
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      assertNoDbError(error, logger, 'content.getServiceBySlug');
      if (!data) throw notFound('That service could not be found.');
      return mapService(data);
    },

    async listCourses() {
      const { data, error } = await getDb()
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });
      assertNoDbError(error, logger, 'content.listCourses');
      return (data ?? []).map(mapCourse);
    },

    async getCourseBySlug(slug) {
      const { data, error } = await getDb()
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      assertNoDbError(error, logger, 'content.getCourseBySlug');
      if (!data) throw notFound('That course could not be found.');
      return mapCourse(data);
    },

    async listProjects(category, featured) {
      const db = getDb();
      let query = db
        .from('projects')
        .select('*')
        .eq('published', true)
        .eq('is_sample', false);
      if (category) query = query.eq('category', category);
      if (featured) query = query.eq('featured', true);

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('completed_at', { ascending: false, nullsFirst: false });
      assertNoDbError(error, logger, 'content.listProjects');

      const projects = data ?? [];
      if (projects.length === 0) return [];

      const { data: images, error: imageError } = await db
        .from('project_images')
        .select('id,project_id,image_url,alt_text')
        .in(
          'project_id',
          projects.map((project) => project.id)
        )
        .order('sort_order', { ascending: true });
      assertNoDbError(imageError, logger, 'content.listProjects.images');

      return projects.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        category: row.category,
        summary: row.summary,
        description: row.description,
        completed_at: row.completed_at,
        featured: row.featured,
        sort_order: row.sort_order,
        images: (images ?? [])
          .filter((image) => image.project_id === row.id)
          .map((image) => ({
            id: image.id,
            image_url: image.image_url,
            alt_text: image.alt_text
          }))
      }));
    },

    async getProjectBySlug(slug) {
      const db = getDb();
      const { data, error } = await db
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .eq('is_sample', false)
        .maybeSingle();
      assertNoDbError(error, logger, 'content.getProjectBySlug');
      if (!data) throw notFound('That project could not be found.');

      const { data: images, error: imageError } = await db
        .from('project_images')
        .select('id,image_url,alt_text')
        .eq('project_id', data.id)
        .order('sort_order', { ascending: true });
      assertNoDbError(imageError, logger, 'content.getProjectBySlug.images');

      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        category: data.category,
        summary: data.summary,
        description: data.description,
        completed_at: data.completed_at,
        featured: data.featured,
        sort_order: data.sort_order,
        images: images ?? []
      };
    },

    async listProducts(options = {}) {
      let query = getDb()
        .from('products')
        .select('*')
        .eq('published', true)
        .eq('is_sample', false);

      if (options.category) query = query.eq('category', options.category);
      if (options.search) {
        const filter = buildIlikeOrFilter(['name', 'description', 'sku', 'category'], options.search);
        if (filter) query = query.or(filter);
      }

      const { data, error } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      assertNoDbError(error, logger, 'content.listProducts');
      return (data ?? []).map(mapProduct);
    },

    async getProductBySlug(slug) {
      const { data, error } = await getDb()
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .eq('is_sample', false)
        .maybeSingle();
      assertNoDbError(error, logger, 'content.getProductBySlug');
      if (!data) throw notFound('That product could not be found.');
      return mapProduct(data);
    },

    async listStaff() {
      const { data, error } = await getDb()
        .from('staff_profiles')
        .select('id,full_name,title,bio,photo_url,sort_order')
        .eq('is_public', true)
        .order('sort_order', { ascending: true });
      assertNoDbError(error, logger, 'content.listStaff');
      return data ?? [];
    },

    async getPublicSettings() {
      const { data, error } = await getDb()
        .from('site_settings')
        .select('key,value')
        .in('key', ['company_profile', 'homepage']);
      assertNoDbError(error, logger, 'content.getPublicSettings');

      const settings: PublicSiteSettings = { company_profile: null, homepage: null };
      for (const row of data ?? []) {
        if (row.key === 'company_profile' || row.key === 'homepage') {
          settings[row.key] = (row.value ?? null) as Record<string, unknown> | null;
        }
      }
      return settings;
    }
  };
}
