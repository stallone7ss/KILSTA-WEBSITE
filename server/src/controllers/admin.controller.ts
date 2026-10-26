import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { z } from 'zod';
import type { AppContext } from '../context';
import { hashIp } from '../utils/ip';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest, AppError, notFound, unauthorized } from '../utils/errors';
import { buildPaginationMeta, sendSuccess } from '../utils/http';
import { toCsv, type CsvColumn } from '../utils/csv';
import type { AdminActor } from '../services/admin.service';
import type { AdminListQuery } from '../validators/admin';
import {
  exportEntitySchema,
  idParamSchema,
  settingKeySchema,
  settingUpdateSchema,
  settingValueSchemas,
  userRolesUpdateSchema
} from '../validators/admin';
import { uploadPurposeSchema } from '../validators/admin';

function actorFrom(req: Request): AdminActor {
  if (!req.auth) throw unauthorized();
  return {
    id: req.auth.user.id,
    email: req.auth.user.email,
    ipHash: hashIp(req.ip)
  };
}

function listQuery(res: { locals: Record<string, unknown> }): AdminListQuery {
  return res.locals.query as AdminListQuery;
}

const imageMimeExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    callback(null, Object.keys(imageMimeExtensions).includes(file.mimetype));
  }
});

const exportColumns: Record<string, Array<CsvColumn<Record<string, unknown>>>> = {
  quotes: [
    { key: 'reference', header: 'Reference' },
    { key: 'created_at', header: 'Submitted (UTC)' },
    { key: 'full_name', header: 'Full name' },
    { key: 'organization', header: 'Organization' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'service_category', header: 'Service category' },
    { key: 'requested_service', header: 'Requested service' },
    { key: 'preferred_contact_method', header: 'Preferred contact' },
    { key: 'budget_range', header: 'Budget range' },
    { key: 'preferred_completion_date', header: 'Preferred completion' },
    { key: 'project_description', header: 'Project description' },
    { key: 'status', header: 'Status' },
    { key: 'customer_notification_status', header: 'Customer email' },
    { key: 'business_notification_status', header: 'Business email' },
    { key: 'updated_at', header: 'Updated (UTC)' }
  ],
  contacts: [
    { key: 'created_at', header: 'Received (UTC)' },
    { key: 'full_name', header: 'Full name' },
    { key: 'organization', header: 'Organization' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'subject', header: 'Subject' },
    { key: 'message', header: 'Message' },
    { key: 'status', header: 'Status' },
    { key: 'customer_notification_status', header: 'Customer email' },
    { key: 'business_notification_status', header: 'Business email' }
  ],
  registrations: [
    { key: 'reference', header: 'Reference' },
    { key: 'created_at', header: 'Registered (UTC)' },
    { key: 'full_name', header: 'Full name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'organization', header: 'Organization' },
    { key: 'course_title', header: 'Course' },
    { key: 'preferred_start_date', header: 'Preferred start' },
    { key: 'message', header: 'Message' },
    { key: 'status', header: 'Status' }
  ],
  products: [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price' },
    { key: 'currency', header: 'Currency' },
    { key: 'stock_quantity', header: 'Stock quantity' },
    { key: 'low_stock_threshold', header: 'Low stock threshold' },
    { key: 'track_stock', header: 'Tracks stock' },
    { key: 'published', header: 'Published' },
    { key: 'updated_at', header: 'Updated (UTC)' }
  ],
  projects: [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    { key: 'category', header: 'Category' },
    { key: 'client_name', header: 'Client' },
    { key: 'completed_at', header: 'Completed' },
    { key: 'published', header: 'Published' },
    { key: 'is_sample', header: 'Sample record' }
  ],
  courses: [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price' },
    { key: 'currency', header: 'Currency' },
    { key: 'duration', header: 'Duration' },
    { key: 'published', header: 'Published' }
  ],
  services: [
    { key: 'title', header: 'Title' },
    { key: 'slug', header: 'Slug' },
    { key: 'category', header: 'Category' },
    { key: 'published', header: 'Published' },
    { key: 'featured', header: 'Featured' },
    { key: 'sort_order', header: 'Sort order' }
  ],
  'activity-logs': [
    { key: 'created_at', header: 'Time (UTC)' },
    { key: 'actor_email', header: 'Actor' },
    { key: 'action', header: 'Action' },
    { key: 'entity_type', header: 'Entity type' },
    { key: 'entity_id', header: 'Entity ID' },
    { key: 'ip_hash', header: 'IP hash' }
  ]
};

export function createAdminController(ctx: AppContext) {
  return {
    me: asyncHandler(async (req, res) => {
      if (!req.auth) throw unauthorized();
      const profile = await ctx.auth.getProfile(req.auth.user.id);
      sendSuccess(res, {
        user: req.auth.user,
        profile,
        roles: req.auth.roles,
        permissions: req.auth.permissions
      });
    }),

    dashboard: asyncHandler(async (_req, res) => {
      sendSuccess(res, await ctx.admin.getDashboard());
    }),

    listQuotes: asyncHandler(async (_req, res) => {
      const result = await ctx.admin.listQuotes(listQuery(res));
      const query = listQuery(res);
      sendSuccess(res, result.items, {
        meta: buildPaginationMeta(query.page, query.pageSize, result.total)
      });
    }),

    getQuote: asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      sendSuccess(res, await ctx.admin.getQuote(id));
    }),

    updateQuote: asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      const updated = await ctx.admin.updateQuote(id, req.body, actorFrom(req));
      sendSuccess(res, updated);
    }),

    updateQuoteStatus: asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      const updated = await ctx.admin.updateQuote(
        id,
        { status: req.body.status },
        actorFrom(req)
      );
      sendSuccess(res, updated);
    }),

    listContacts: asyncHandler(async (_req, res) => {
      const result = await ctx.admin.listContacts(listQuery(res));
      const query = listQuery(res);
      sendSuccess(res, result.items, {
        meta: buildPaginationMeta(query.page, query.pageSize, result.total)
      });
    }),

    updateContact: asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      sendSuccess(res, await ctx.admin.updateContact(id, req.body, actorFrom(req)));
    }),

    listRegistrations: asyncHandler(async (_req, res) => {
      const result = await ctx.admin.listRegistrations(listQuery(res));
      const query = listQuery(res);
      sendSuccess(res, result.items, {
        meta: buildPaginationMeta(query.page, query.pageSize, result.total)
      });
    }),

    updateRegistration: asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      sendSuccess(res, await ctx.admin.updateRegistration(id, req.body, actorFrom(req)));
    }),

    listSettings: asyncHandler(async (_req, res) => {
      sendSuccess(res, await ctx.admin.listSettings());
    }),

    updateSetting: asyncHandler(async (req, res) => {
      const { key } = z.object({ key: settingKeySchema }).parse(req.params);
      const body = req.body as z.infer<typeof settingUpdateSchema>;
      const parsedValue = settingValueSchemas[key].parse(body.value);
      const updated = await ctx.admin.updateSetting(
        key,
        parsedValue as Record<string, unknown>,
        body.description,
        actorFrom(req)
      );
      sendSuccess(res, updated);
    }),

    listUsers: asyncHandler(async (_req, res) => {
      const result = await ctx.admin.listUsers(listQuery(res));
      const query = listQuery(res);
      sendSuccess(res, result.items, {
        meta: buildPaginationMeta(query.page, query.pageSize, result.total)
      });
    }),

    updateUserRoles: asyncHandler(async (req, res) => {
      const { id } = idParamSchema.parse(req.params);
      const body = req.body as z.infer<typeof userRolesUpdateSchema>;
      sendSuccess(res, await ctx.admin.setUserRoles(id, body.roles, actorFrom(req)));
    }),

    listActivityLogs: asyncHandler(async (_req, res) => {
      const result = await ctx.admin.listActivityLogs(listQuery(res));
      const query = listQuery(res);
      sendSuccess(res, result.items, {
        meta: buildPaginationMeta(query.page, query.pageSize, result.total)
      });
    }),

    exportCsv: asyncHandler(async (req, res) => {
      if (!req.auth) throw unauthorized();
      const { entity } = z.object({ entity: exportEntitySchema }).parse(req.params);
      if (entity === 'activity-logs' && !req.auth.roles.includes('admin')) {
        throw new AppError(403, 'FORBIDDEN', 'Only administrators can export audit logs.');
      }
      const query = listQuery(res);
      const rows = await ctx.admin.exportRows(entity, query, actorFrom(req));
      const columns = exportColumns[entity];
      const csv = toCsv(rows, columns);
      const date = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="kilsta-${entity}-${date}.csv"`
      );
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(csv);
    }),

    uploadImage: asyncHandler(async (req, res) => {
      if (!req.file) {
        throw badRequest('Choose a JPEG, PNG or WebP image up to 5 MB.');
      }
      const purpose = uploadPurposeSchema.parse(req.query.purpose);
      const extension = imageMimeExtensions[req.file.mimetype];
      if (!extension) throw badRequest('Unsupported image type.');

      const path = `${purpose}/${randomUUID()}.${extension}`;
      const { error } = await ctx
        .getDb()
        .storage.from('media')
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '31536000',
          upsert: false
        });

      if (error) {
        ctx.logger.error('Supabase Storage upload failed', { code: error.name });
        throw new AppError(502, 'UPLOAD_FAILED', 'The image could not be uploaded.');
      }

      const { data } = ctx.getDb().storage.from('media').getPublicUrl(path);
      if (!data.publicUrl) {
        throw new AppError(500, 'UPLOAD_URL_FAILED', 'The uploaded image URL could not be created.');
      }

      ctx.logger.info('Media uploaded', { purpose, path, actor: actorFrom(req).id });
      sendSuccess(res, { url: data.publicUrl, path }, { status: 201 });
    }),

    notFound: () => {
      throw notFound('Admin endpoint not found.');
    }
  };
}
