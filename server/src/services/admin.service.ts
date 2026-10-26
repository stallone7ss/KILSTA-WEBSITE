/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json, Tables, TablesUpdate } from '../types/database.types';
import type { AdminListQuery } from '../validators/admin';
import { assertNoDbError } from '../utils/asyncHandler';
import { conflict, notFound, unprocessable } from '../utils/errors';
import { buildIlikeOrFilter } from '../utils/csv';
import {
  canTransitionQuote,
  canTransitionRegistration,
  QUOTE_STATUS_TRANSITIONS,
  REGISTRATION_STATUS_TRANSITIONS,
  type Role
} from '../config/permissions';
import type { Logger } from '../utils/logger';

export interface AdminActor {
  id: string;
  email: string;
  ipHash: string | null;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export type CatalogResource = 'services' | 'courses' | 'projects' | 'products' | 'staff-profiles';

interface CatalogConfig {
  table: 'services' | 'courses' | 'projects' | 'products' | 'staff_profiles';
  searchColumns: string[];
  sortable: string[];
  defaultSort: string;
  defaultOrder: 'asc' | 'desc';
  categoryColumn?: string;
  hasCategory: boolean;
  hasPublished: boolean;
}

const CATALOG: Record<CatalogResource, CatalogConfig> = {
  services: {
    table: 'services',
    searchColumns: ['title', 'summary', 'slug'],
    sortable: ['created_at', 'updated_at', 'title', 'sort_order', 'category'],
    defaultSort: 'sort_order',
    defaultOrder: 'asc',
    categoryColumn: 'category',
    hasCategory: true,
    hasPublished: true
  },
  courses: {
    table: 'courses',
    searchColumns: ['title', 'summary', 'slug'],
    sortable: ['created_at', 'updated_at', 'title', 'sort_order', 'category', 'price'],
    defaultSort: 'sort_order',
    defaultOrder: 'asc',
    categoryColumn: 'category',
    hasCategory: true,
    hasPublished: true
  },
  projects: {
    table: 'projects',
    searchColumns: ['title', 'summary', 'slug', 'client_name'],
    sortable: ['created_at', 'updated_at', 'title', 'sort_order', 'category', 'completed_at'],
    defaultSort: 'sort_order',
    defaultOrder: 'asc',
    categoryColumn: 'category',
    hasCategory: true,
    hasPublished: true
  },
  products: {
    table: 'products',
    searchColumns: ['name', 'sku', 'category', 'description'],
    sortable: ['created_at', 'updated_at', 'name', 'sort_order', 'price', 'stock_quantity', 'category'],
    defaultSort: 'sort_order',
    defaultOrder: 'asc',
    categoryColumn: 'category',
    hasCategory: true,
    hasPublished: true
  },
  'staff-profiles': {
    table: 'staff_profiles',
    searchColumns: ['full_name', 'title'],
    sortable: ['created_at', 'updated_at', 'full_name', 'sort_order'],
    defaultSort: 'sort_order',
    defaultOrder: 'asc',
    hasCategory: false,
    hasPublished: false
  }
};

const QUOTE_SORTABLE = [
  'created_at',
  'updated_at',
  'status',
  'reference',
  'full_name',
  'preferred_completion_date'
];
const CONTACT_SORTABLE = ['created_at', 'updated_at', 'status', 'full_name', 'subject'];
const REGISTRATION_SORTABLE = ['created_at', 'updated_at', 'status', 'full_name', 'reference'];
const USER_SORTABLE = ['created_at', 'full_name', 'email'];
const AUDIT_SORTABLE = ['created_at', 'action', 'entity_type'];

export interface DashboardMetrics {
  quotes: {
    total: number;
    byStatus: Record<string, number>;
    recent: Array<{
      id: string;
      reference: string;
      full_name: string;
      requested_service: string;
      status: string;
      created_at: string;
    }>;
    unassigned: number;
  };
  contacts: {
    total: number;
    newCount: number;
    recent: Array<{
      id: string;
      full_name: string;
      subject: string;
      status: string;
      created_at: string;
    }>;
  };
  registrations: { total: number; pending: number };
  catalog: {
    publishedServices: number;
    publishedCourses: number;
    publishedProjects: number;
    publishedProducts: number;
    lowStockProducts: number;
  };
}

export interface PublicUserSummary {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  roles: Role[];
}

export interface AdminService {
  getDashboard(): Promise<DashboardMetrics>;
  listQuotes(query: AdminListQuery): Promise<PageResult<Tables<'quote_requests'>>>;
  getQuote(id: string): Promise<Tables<'quote_requests'>>;
  updateQuote(
    id: string,
    patch: TablesUpdate<'quote_requests'>,
    actor: AdminActor
  ): Promise<Tables<'quote_requests'>>;
  listContacts(query: AdminListQuery): Promise<PageResult<Tables<'contact_messages'>>>;
  updateContact(
    id: string,
    patch: TablesUpdate<'contact_messages'>,
    actor: AdminActor
  ): Promise<Tables<'contact_messages'>>;
  listRegistrations(
    query: AdminListQuery
  ): Promise<PageResult<Tables<'course_registrations'> & { course_title: string | null }>>;
  updateRegistration(
    id: string,
    patch: TablesUpdate<'course_registrations'>,
    actor: AdminActor
  ): Promise<Tables<'course_registrations'>>;
  listCatalog(
    resource: CatalogResource,
    query: AdminListQuery
  ): Promise<PageResult<Record<string, unknown>>>;
  createCatalogRecord(
    resource: CatalogResource,
    values: Record<string, unknown>,
    actor: AdminActor
  ): Promise<Record<string, unknown>>;
  updateCatalogRecord(
    resource: CatalogResource,
    id: string,
    values: Record<string, unknown>,
    actor: AdminActor
  ): Promise<Record<string, unknown>>;
  deleteCatalogRecord(
    resource: CatalogResource,
    id: string,
    actor: AdminActor
  ): Promise<void>;
  updateProductStock(
    id: string,
    values: { stock_quantity: number; track_stock?: boolean },
    actor: AdminActor
  ): Promise<Tables<'products'>>;
  listProjectImages(projectId: string): Promise<Tables<'project_images'>[]>;
  addProjectImage(
    projectId: string,
    values: { image_url: string; alt_text: string; sort_order?: number },
    actor: AdminActor
  ): Promise<Tables<'project_images'>>;
  deleteProjectImage(projectId: string, imageId: string, actor: AdminActor): Promise<void>;
  listSettings(): Promise<Tables<'site_settings'>[]>;
  updateSetting(
    key: string,
    value: Record<string, unknown>,
    description: string | undefined,
    actor: AdminActor
  ): Promise<Tables<'site_settings'>>;
  listUsers(query: AdminListQuery): Promise<PageResult<PublicUserSummary>>;
  setUserRoles(
    userId: string,
    roles: Role[],
    actor: AdminActor
  ): Promise<{ id: string; roles: Role[] }>;
  listActivityLogs(query: AdminListQuery): Promise<PageResult<Tables<'activity_logs'>>>;
  exportRows(
    entity: string,
    query: AdminListQuery,
    actor: AdminActor
  ): Promise<Record<string, unknown>[]>;
}

export function createAdminService(
  getDb: () => SupabaseClient<Database>,
  logger: Logger
): AdminService {
  async function recordAudit(
    actor: AdminActor,
    action: string,
    entityType: string,
    entityId: string | null,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      const { error } = await getDb()
        .from('activity_logs')
        .insert({
          actor_id: actor.id,
          actor_email: actor.email,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata: metadata as Json,
          ip_hash: actor.ipHash
        });
      if (error) {
        logger.error('Failed to write audit log', { code: error.code, action, entityType });
      }
    } catch (error) {
      logger.error('Failed to write audit log', {
        reason: error instanceof Error ? error.message : 'unknown error',
        action
      });
    }
  }

  async function countRows(
    table: keyof Database['public']['Tables'],
    filter?: (query: any) => any
  ): Promise<number> {
    let query = (getDb() as any)
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (filter) query = filter(query);
    const { count, error } = await query;
    assertNoDbError(error, logger, `admin.countRows.${table}`);
    return count ?? 0;
  }

  function applyListFilters(
    query: any,
    config: { searchColumns: string[]; hasCategory: boolean; categoryColumn?: string; hasPublished: boolean },
    listQuery: AdminListQuery
  ): any {
    let next = query;
    if (listQuery.search) {
      const filter = buildIlikeOrFilter(config.searchColumns, listQuery.search);
      if (filter) next = next.or(filter);
    }
    if (config.hasCategory && config.categoryColumn && listQuery.category) {
      next = next.eq(config.categoryColumn, listQuery.category);
    }
    if (config.hasPublished && listQuery.published) {
      next = next.eq('published', listQuery.published === 'true');
    }
    return next;
  }

  async function listQuotes(query: AdminListQuery) {
    const db = getDb();
    let request: any = db.from('quote_requests').select('*', { count: 'exact' });
    if (query.search) {
      const filter = buildIlikeOrFilter(
        ['full_name', 'email', 'reference', 'requested_service', 'organization'],
        query.search
      );
      if (filter) request = request.or(filter);
    }
    if (query.status) request = request.eq('status', query.status);
    if (query.category) request = request.eq('service_category', query.category);

    const sort = query.sort && QUOTE_SORTABLE.includes(query.sort) ? query.sort : 'created_at';
    const { data, error, count } = await request
      .order(sort, { ascending: query.order === 'asc' })
      .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);

    assertNoDbError(error, logger, 'admin.listQuotes');
    return { items: (data ?? []) as Tables<'quote_requests'>[], total: count ?? 0 };
  }

  async function listContacts(query: AdminListQuery) {
    let request: any = getDb().from('contact_messages').select('*', { count: 'exact' });
    if (query.search) {
      const filter = buildIlikeOrFilter(
        ['full_name', 'email', 'subject', 'organization'],
        query.search
      );
      if (filter) request = request.or(filter);
    }
    if (query.status) request = request.eq('status', query.status);

    const sort = query.sort && CONTACT_SORTABLE.includes(query.sort) ? query.sort : 'created_at';
    const { data, error, count } = await request
      .order(sort, { ascending: query.order === 'asc' })
      .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);

    assertNoDbError(error, logger, 'admin.listContacts');
    return { items: (data ?? []) as Tables<'contact_messages'>[], total: count ?? 0 };
  }

  async function attachCourseTitles(
    rows: Tables<'course_registrations'>[]
  ): Promise<Array<Tables<'course_registrations'> & { course_title: string | null }>> {
    if (rows.length === 0) return [];
    const courseIds = [...new Set(rows.map((row) => row.course_id))];
    const { data: courses, error } = await getDb()
      .from('courses')
      .select('id,title')
      .in('id', courseIds);
    assertNoDbError(error, logger, 'admin.attachCourseTitles');
    const titleMap = new Map((courses ?? []).map((course) => [course.id, course.title]));
    return rows.map((row) => ({ ...row, course_title: titleMap.get(row.course_id) ?? null }));
  }

  async function listRegistrations(query: AdminListQuery) {
    let request: any = getDb().from('course_registrations').select('*', { count: 'exact' });
    if (query.search) {
      const filter = buildIlikeOrFilter(
        ['full_name', 'email', 'phone', 'reference', 'organization'],
        query.search
      );
      if (filter) request = request.or(filter);
    }
    if (query.status) request = request.eq('status', query.status);
    if (query.courseId) request = request.eq('course_id', query.courseId);

    const sort =
      query.sort && REGISTRATION_SORTABLE.includes(query.sort) ? query.sort : 'created_at';
    const { data, error, count } = await request
      .order(sort, { ascending: query.order === 'asc' })
      .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);

    assertNoDbError(error, logger, 'admin.listRegistrations');
    const items = await attachCourseTitles((data ?? []) as Tables<'course_registrations'>[]);
    return { items, total: count ?? 0 };
  }

  async function exportRows(
    entity: string,
    query: AdminListQuery,
    actor: AdminActor
  ): Promise<Record<string, unknown>[]> {
    const db = getDb() as any;
    const maxRows = 5000;
    const batchSize = 500;
    const rows: Record<string, unknown>[] = [];

    const tableMap: Record<string, string> = {
      quotes: 'quote_requests',
      contacts: 'contact_messages',
      registrations: 'course_registrations',
      products: 'products',
      projects: 'projects',
      courses: 'courses',
      services: 'services',
      'activity-logs': 'activity_logs'
    };
    const table = tableMap[entity];
    if (!table) throw unprocessable('Unknown export type.');

    let offset = 0;
    while (offset < maxRows) {
      let request = db.from(table).select('*');
      if (query.status) {
        const statusColumn =
          entity === 'quotes' || entity === 'contacts' || entity === 'registrations'
            ? 'status'
            : null;
        if (statusColumn) request = request.eq(statusColumn, query.status);
      }
      if (query.category) {
        const categoryColumn = entity === 'quotes' ? 'service_category' : 'category';
        if (['quotes', 'products', 'projects', 'courses', 'services'].includes(entity)) {
          request = request.eq(categoryColumn, query.category);
        }
      }
      if (query.search) {
        const searchColumns: Record<string, string[]> = {
          quotes: ['full_name', 'email', 'reference', 'requested_service'],
          contacts: ['full_name', 'email', 'subject'],
          registrations: ['full_name', 'email', 'reference'],
          products: ['name', 'sku', 'category'],
          projects: ['title', 'summary'],
          courses: ['title', 'summary'],
          services: ['title', 'summary'],
          'activity-logs': ['actor_email', 'action', 'entity_type']
        };
        const filter = buildIlikeOrFilter(searchColumns[entity] ?? [], query.search);
        if (filter) request = request.or(filter);
      }
      if (entity === 'activity-logs') {
        if (query.action) request = request.eq('action', query.action);
        if (query.entityType) request = request.eq('entity_type', query.entityType);
      }

      const { data, error } = await request
        .order('created_at', { ascending: false })
        .range(offset, offset + batchSize - 1);

      assertNoDbError(error, logger, `admin.exportRows.${entity}`);
      const batch = (data ?? []) as Record<string, unknown>[];
      rows.push(...batch);
      if (batch.length < batchSize) break;
      offset += batchSize;
    }

    if (entity === 'registrations' && rows.length > 0) {
      const courseIds = [...new Set(rows.map((row) => row.course_id as string))];
      const { data: courses, error } = await db.from('courses').select('id,title').in('id', courseIds);
      assertNoDbError(error, logger, 'admin.exportRows.courses');
      const titleMap = new Map(
        ((courses ?? []) as Array<{ id: string; title: string }>).map((course) => [
          course.id,
          course.title
        ])
      );
      const mapped = rows.map((row) => ({
        ...row,
        course_title: titleMap.get(row.course_id as string) ?? ''
      }));
      await recordAudit(actor, 'export', entity, null, {
        count: mapped.length,
        filters: {
          search: Boolean(query.search),
          status: query.status ?? null,
          category: query.category ?? null
        }
      });
      return mapped;
    }

    await recordAudit(actor, 'export', entity, null, {
      count: rows.length,
      filters: {
        search: Boolean(query.search),
        status: query.status ?? null,
        category: query.category ?? null
      }
    });
    return rows;
  }

  return {
    async getDashboard() {
      const [
        quoteTotal,
        newQuotes,
        underReview,
        quoted,
        accepted,
        inProgress,
        completed,
        rejected,
        unassigned,
        contactsTotal,
        contactsNew,
        registrationsTotal,
        registrationsPending,
        publishedServices,
        publishedCourses,
        publishedProjects,
        publishedProducts
      ] = await Promise.all([
        countRows('quote_requests'),
        countRows('quote_requests', (q) => q.eq('status', 'New')),
        countRows('quote_requests', (q) => q.eq('status', 'Under Review')),
        countRows('quote_requests', (q) => q.eq('status', 'Quoted')),
        countRows('quote_requests', (q) => q.eq('status', 'Accepted')),
        countRows('quote_requests', (q) => q.eq('status', 'In Progress')),
        countRows('quote_requests', (q) => q.eq('status', 'Completed')),
        countRows('quote_requests', (q) => q.eq('status', 'Rejected')),
        countRows('quote_requests', (q) => q.is('assigned_to', null)),
        countRows('contact_messages'),
        countRows('contact_messages', (q) => q.eq('status', 'New')),
        countRows('course_registrations'),
        countRows('course_registrations', (q) => q.eq('status', 'Pending')),
        countRows('services', (q) => q.eq('published', true)),
        countRows('courses', (q) => q.eq('published', true)),
        countRows('projects', (q) => q.eq('published', true).eq('is_sample', false)),
        countRows('products', (q) => q.eq('published', true).eq('is_sample', false))
      ]);

      const { data: recentQuotes, error: recentQuoteError } = await getDb()
        .from('quote_requests')
        .select('id,reference,full_name,requested_service,status,created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      assertNoDbError(recentQuoteError, logger, 'admin.dashboard.recentQuotes');

      const { data: recentContacts, error: recentContactError } = await getDb()
        .from('contact_messages')
        .select('id,full_name,subject,status,created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      assertNoDbError(recentContactError, logger, 'admin.dashboard.recentContacts');

      const { data: stockRows, error: stockError } = await getDb()
        .from('products')
        .select('stock_quantity,low_stock_threshold')
        .eq('track_stock', true);
      assertNoDbError(stockError, logger, 'admin.dashboard.stock');
      const lowStockProducts = (stockRows ?? []).filter(
        (row) => row.stock_quantity <= row.low_stock_threshold
      ).length;

      return {
        quotes: {
          total: quoteTotal,
          byStatus: {
            New: newQuotes,
            'Under Review': underReview,
            Quoted: quoted,
            Accepted: accepted,
            'In Progress': inProgress,
            Completed: completed,
            Rejected: rejected
          },
          recent: recentQuotes ?? [],
          unassigned
        },
        contacts: {
          total: contactsTotal,
          newCount: contactsNew,
          recent: recentContacts ?? []
        },
        registrations: {
          total: registrationsTotal,
          pending: registrationsPending
        },
        catalog: {
          publishedServices,
          publishedCourses,
          publishedProjects,
          publishedProducts,
          lowStockProducts
        }
      };
    },

    listQuotes,

    async getQuote(id) {
      const { data, error } = await getDb()
        .from('quote_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      assertNoDbError(error, logger, 'admin.getQuote');
      if (!data) throw notFound('Quote request not found.');
      return data;
    },

    async updateQuote(id, patch, actor) {
      const existing = await this.getQuote(id);
      const payload: TablesUpdate<'quote_requests'> = {};

      if (patch.status !== undefined && patch.status !== existing.status) {
        if (!canTransitionQuote(existing.status, patch.status)) {
          throw unprocessable(
            `A quote cannot move from "${existing.status}" to "${patch.status}".`,
            { allowedTransitions: QUOTE_STATUS_TRANSITIONS[existing.status] ?? [] }
          );
        }
        payload.status = patch.status;
      }
      if (patch.internal_notes !== undefined) payload.internal_notes = patch.internal_notes;
      if (patch.assigned_to !== undefined) {
        if (patch.assigned_to) {
          const { data: profile, error } = await getDb()
            .from('profiles')
            .select('id')
            .eq('id', patch.assigned_to)
            .maybeSingle();
          assertNoDbError(error, logger, 'admin.updateQuote.assignee');
          if (!profile) throw unprocessable('The selected assignee does not exist.');
        }
        payload.assigned_to = patch.assigned_to;
      }

      if (Object.keys(payload).length === 0) return existing;

      const { data, error } = await getDb()
        .from('quote_requests')
        .update(payload)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      assertNoDbError(error, logger, 'admin.updateQuote');
      if (!data) throw notFound('Quote request not found.');

      await recordAudit(actor, 'quote.update', 'quote_requests', id, {
        fields: Object.keys(payload),
        fromStatus: existing.status,
        toStatus: data.status
      });
      return data;
    },

    listContacts,

    async updateContact(id, patch, actor) {
      const { data: existing, error: readError } = await getDb()
        .from('contact_messages')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      assertNoDbError(readError, logger, 'admin.updateContact.read');
      if (!existing) throw notFound('Contact message not found.');

      const payload: TablesUpdate<'contact_messages'> = {};
      if (patch.status !== undefined) payload.status = patch.status;
      if (patch.internal_notes !== undefined) payload.internal_notes = patch.internal_notes;
      if (Object.keys(payload).length === 0) return existing;

      const { data, error } = await getDb()
        .from('contact_messages')
        .update(payload)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      assertNoDbError(error, logger, 'admin.updateContact');
      if (!data) throw notFound('Contact message not found.');

      await recordAudit(actor, 'contact.update', 'contact_messages', id, {
        fields: Object.keys(payload),
        fromStatus: existing.status,
        toStatus: data.status
      });
      return data;
    },

    listRegistrations,

    async updateRegistration(id, patch, actor) {
      const { data: existing, error: readError } = await getDb()
        .from('course_registrations')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      assertNoDbError(readError, logger, 'admin.updateRegistration.read');
      if (!existing) throw notFound('Course registration not found.');

      const payload: TablesUpdate<'course_registrations'> = {};
      if (patch.status !== undefined && patch.status !== existing.status) {
        if (!canTransitionRegistration(existing.status, patch.status)) {
          throw unprocessable(
            `A registration cannot move from "${existing.status}" to "${patch.status}".`,
            { allowedTransitions: REGISTRATION_STATUS_TRANSITIONS[existing.status] ?? [] }
          );
        }
        payload.status = patch.status;
      }
      if (patch.internal_notes !== undefined) payload.internal_notes = patch.internal_notes;
      if (Object.keys(payload).length === 0) return existing;

      const { data, error } = await getDb()
        .from('course_registrations')
        .update(payload)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      assertNoDbError(error, logger, 'admin.updateRegistration');
      if (!data) throw notFound('Course registration not found.');

      await recordAudit(actor, 'registration.update', 'course_registrations', id, {
        fields: Object.keys(payload),
        fromStatus: existing.status,
        toStatus: data.status
      });
      return data;
    },

    async listCatalog(resource, query) {
      const config = CATALOG[resource];
      if (!config) throw unprocessable('Unknown resource.');
      let request: any = (getDb() as any)
        .from(config.table)
        .select('*', { count: 'exact' });
      request = applyListFilters(request, config, query);

      const sort =
        query.sort && config.sortable.includes(query.sort) ? query.sort : config.defaultSort;
      const ascending = query.sort ? query.order === 'asc' : config.defaultOrder === 'asc';

      const { data, error, count } = await request
        .order(sort, { ascending })
        .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);

      assertNoDbError(error, logger, `admin.listCatalog.${resource}`);
      return {
        items: (data ?? []) as Record<string, unknown>[],
        total: count ?? 0
      };
    },

    async createCatalogRecord(resource, values, actor) {
      const config = CATALOG[resource];
      if (!config) throw unprocessable('Unknown resource.');
      const { data, error } = await (getDb() as any)
        .from(config.table)
        .insert(values)
        .select('*')
        .single();
      assertNoDbError(error, logger, `admin.createCatalogRecord.${resource}`);
      if (!data) throw unprocessable('The record could not be created.');
      await recordAudit(actor, 'create', resource, data.id, { fields: Object.keys(values) });
      return data as Record<string, unknown>;
    },

    async updateCatalogRecord(resource, id, values, actor) {
      const config = CATALOG[resource];
      if (!config) throw unprocessable('Unknown resource.');
      const { data, error } = await (getDb() as any)
        .from(config.table)
        .update(values)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      assertNoDbError(error, logger, `admin.updateCatalogRecord.${resource}`);
      if (!data) throw notFound('Record not found.');
      await recordAudit(actor, 'update', resource, id, { fields: Object.keys(values) });
      return data as Record<string, unknown>;
    },

    async deleteCatalogRecord(resource, id, actor) {
      const config = CATALOG[resource];
      if (!config) throw unprocessable('Unknown resource.');
      const { data, error } = await (getDb() as any)
        .from(config.table)
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();
      assertNoDbError(error, logger, `admin.deleteCatalogRecord.${resource}`);
      if (!data) throw notFound('Record not found.');
      await recordAudit(actor, 'delete', resource, id, {});
    },

    async updateProductStock(id, values, actor) {
      const payload: TablesUpdate<'products'> = {
        stock_quantity: values.stock_quantity
      };
      if (values.track_stock !== undefined) payload.track_stock = values.track_stock;

      const { data, error } = await getDb()
        .from('products')
        .update(payload)
        .eq('id', id)
        .select('*')
        .maybeSingle();
      assertNoDbError(error, logger, 'admin.updateProductStock');
      if (!data) throw notFound('Product not found.');
      await recordAudit(actor, 'product.stock_update', 'products', id, {
        stock_quantity: values.stock_quantity,
        track_stock: values.track_stock
      });
      return data;
    },

    async listProjectImages(projectId) {
      const { data, error } = await getDb()
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true });
      assertNoDbError(error, logger, 'admin.listProjectImages');
      return data ?? [];
    },

    async addProjectImage(projectId, values, actor) {
      const { data: project, error: projectError } = await getDb()
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .maybeSingle();
      assertNoDbError(projectError, logger, 'admin.addProjectImage.project');
      if (!project) throw notFound('Project not found.');

      const { data, error } = await getDb()
        .from('project_images')
        .insert({
          project_id: projectId,
          image_url: values.image_url,
          alt_text: values.alt_text,
          sort_order: values.sort_order ?? 0
        })
        .select('*')
        .single();
      assertNoDbError(error, logger, 'admin.addProjectImage');
      if (!data) throw unprocessable('The image could not be added.');
      await recordAudit(actor, 'project_image.create', 'project_images', data.id, {
        project_id: projectId
      });
      return data;
    },

    async deleteProjectImage(projectId, imageId, actor) {
      const { data, error } = await getDb()
        .from('project_images')
        .delete()
        .eq('id', imageId)
        .eq('project_id', projectId)
        .select('id')
        .maybeSingle();
      assertNoDbError(error, logger, 'admin.deleteProjectImage');
      if (!data) throw notFound('Image not found.');
      await recordAudit(actor, 'project_image.delete', 'project_images', imageId, { projectId });
    },

    async listSettings() {
      const { data, error } = await getDb()
        .from('site_settings')
        .select('*')
        .order('key', { ascending: true });
      assertNoDbError(error, logger, 'admin.listSettings');
      return data ?? [];
    },

    async updateSetting(key, value, description, actor) {
      const { data, error } = await getDb()
        .from('site_settings')
        .upsert(
          {
            key,
            value: value as Json,
            ...(description ? { description } : {}),
            updated_by: actor.id
          },
          { onConflict: 'key' }
        )
        .select('*')
        .single();
      assertNoDbError(error, logger, 'admin.updateSetting');
      if (!data) throw unprocessable('The setting could not be saved.');
      await recordAudit(actor, 'settings.update', 'site_settings', key, { key });
      return data;
    },

    async listUsers(query) {
      let request: any = getDb()
        .from('profiles')
        .select('id,email,full_name,phone,created_at', { count: 'exact' });
      if (query.search) {
        const filter = buildIlikeOrFilter(['full_name', 'email'], query.search);
        if (filter) request = request.or(filter);
      }
      const sort = query.sort && USER_SORTABLE.includes(query.sort) ? query.sort : 'created_at';

      const { data, error, count } = await request
        .order(sort, { ascending: query.order === 'asc' })
        .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);

      assertNoDbError(error, logger, 'admin.listUsers');
      const profiles = (data ?? []) as Array<Omit<PublicUserSummary, 'roles'>>;
      if (profiles.length === 0) return { items: [], total: count ?? 0 };

      const { data: roleRows, error: roleError } = await getDb()
        .from('user_roles')
        .select('user_id,role')
        .in(
          'user_id',
          profiles.map((profile) => profile.id)
        );
      assertNoDbError(roleError, logger, 'admin.listUsers.roles');

      const rolesByUser = new Map<string, Role[]>();
      for (const row of roleRows ?? []) {
        const list = rolesByUser.get(row.user_id) ?? [];
        list.push(row.role);
        rolesByUser.set(row.user_id, list);
      }

      return {
        items: profiles.map((profile) => ({
          ...profile,
          roles: rolesByUser.get(profile.id) ?? []
        })),
        total: count ?? 0
      };
    },

    async setUserRoles(userId, roles, actor) {
      const { data: target, error: targetError } = await getDb()
        .from('profiles')
        .select('id,email')
        .eq('id', userId)
        .maybeSingle();
      assertNoDbError(targetError, logger, 'admin.setUserRoles.target');
      if (!target) throw notFound('User not found.');

      if (userId === actor.id && !roles.includes('admin')) {
        throw conflict('You cannot remove your own administrator role.');
      }

      const { data: currentRoles, error: currentError } = await getDb()
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      assertNoDbError(currentError, logger, 'admin.setUserRoles.current');

      const wasAdmin = (currentRoles ?? []).some((row) => row.role === 'admin');
      if (wasAdmin && !roles.includes('admin')) {
        const adminCount = await countRows('user_roles', (q) => q.eq('role', 'admin'));
        if (adminCount <= 1) {
          throw conflict('At least one administrator account must remain.');
        }
      }

      if (roles.length > 0) {
        const { error: upsertError } = await getDb()
          .from('user_roles')
          .upsert(
            roles.map((role) => ({ user_id: userId, role })),
            { onConflict: 'user_id,role', ignoreDuplicates: true }
          );
        assertNoDbError(upsertError, logger, 'admin.setUserRoles.upsert');

        const { error: deleteError } = await getDb()
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .not('role', 'in', `(${roles.join(',')})`);
        assertNoDbError(deleteError, logger, 'admin.setUserRoles.deleteExtras');
      } else {
        const { error: deleteError } = await getDb()
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        assertNoDbError(deleteError, logger, 'admin.setUserRoles.deleteAll');
      }

      await recordAudit(actor, 'user.roles_update', 'user_roles', userId, { roles });
      return { id: userId, roles };
    },

    async listActivityLogs(query) {
      let request: any = getDb().from('activity_logs').select('*', { count: 'exact' });
      if (query.search) {
        const filter = buildIlikeOrFilter(['actor_email', 'action', 'entity_type'], query.search);
        if (filter) request = request.or(filter);
      }
      if (query.entityType) request = request.eq('entity_type', query.entityType);
      if (query.action) request = request.eq('action', query.action);

      const sort =
        query.sort && AUDIT_SORTABLE.includes(query.sort) ? query.sort : 'created_at';
      const { data, error, count } = await request
        .order(sort, { ascending: query.order === 'asc' })
        .range((query.page - 1) * query.pageSize, query.page * query.pageSize - 1);

      assertNoDbError(error, logger, 'admin.listActivityLogs');
      return { items: (data ?? []) as Tables<'activity_logs'>[], total: count ?? 0 };
    },

    exportRows
  };
}
