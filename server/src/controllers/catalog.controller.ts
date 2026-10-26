import { z } from 'zod';
import type { AppContext } from '../context';
import type { AdminListQuery } from '../validators/admin';
import type { CatalogResource } from '../services/admin.service';
import {
  courseInputSchema,
  courseUpdateSchema,
  productInputSchema,
  productUpdateSchema,
  projectIdParamSchema,
  projectImageInputSchema,
  projectImageParamSchema,
  projectInputSchema,
  projectUpdateSchema,
  serviceInputSchema,
  serviceUpdateSchema,
  staffProfileInputSchema,
  staffProfileUpdateSchema,
  productStockUpdateSchema
} from '../validators/admin';
import { asyncHandler } from '../utils/asyncHandler';
import { badRequest } from '../utils/errors';
import { buildPaginationMeta, sendCreated, sendSuccess } from '../utils/http';
import { hashIp } from '../utils/ip';
import { unauthorized } from '../utils/errors';
import type { AdminActor } from '../services/admin.service';

function actor(req: {
  auth?: { user: { id: string; email: string } };
  ip?: string;
}): AdminActor {
  if (!req.auth) throw unauthorized();
  return {
    id: req.auth.user.id,
    email: req.auth.user.email,
    ipHash: hashIp(req.ip)
  };
}

const catalogSchemas = {
  services: { create: serviceInputSchema, update: serviceUpdateSchema },
  courses: { create: courseInputSchema, update: courseUpdateSchema },
  projects: { create: projectInputSchema, update: projectUpdateSchema },
  products: { create: productInputSchema, update: productUpdateSchema },
  'staff-profiles': { create: staffProfileInputSchema, update: staffProfileUpdateSchema }
} as const;

export function createCatalogController(ctx: AppContext) {
  const makeHandlers = (resource: CatalogResource) => ({
    list: asyncHandler(async (_req, res) => {
      const query = res.locals.query as AdminListQuery;
      const result = await ctx.admin.listCatalog(resource, query);
      sendSuccess(res, result.items, {
        meta: buildPaginationMeta(query.page, query.pageSize, result.total)
      });
    }),

    create: asyncHandler(async (req, res) => {
      const parsed = catalogSchemas[resource].create.parse(req.body);
      const record = await ctx.admin.createCatalogRecord(
        resource,
        parsed as Record<string, unknown>,
        actor(req)
      );
      sendCreated(res, record);
    }),

    update: asyncHandler(async (req, res) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const parsed = catalogSchemas[resource].update.parse(req.body);
      if (Object.keys(parsed as Record<string, unknown>).length === 0) {
        throw badRequest('Provide at least one field to update.');
      }
      const record = await ctx.admin.updateCatalogRecord(
        resource,
        id,
        parsed as Record<string, unknown>,
        actor(req)
      );
      sendSuccess(res, record);
    }),

    remove: asyncHandler(async (req, res) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      await ctx.admin.deleteCatalogRecord(resource, id, actor(req));
      sendSuccess(res, { deleted: true, id });
    })
  });

  return {
    services: makeHandlers('services'),
    courses: makeHandlers('courses'),
    projects: makeHandlers('projects'),
    products: makeHandlers('products'),
    staffProfiles: makeHandlers('staff-profiles'),

    updateStock: asyncHandler(async (req, res) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
      const parsed = productStockUpdateSchema.parse(req.body);
      sendSuccess(res, await ctx.admin.updateProductStock(id, parsed, actor(req)));
    }),

    listProjectImages: asyncHandler(async (req, res) => {
      const { projectId } = projectIdParamSchema.parse(req.params);
      sendSuccess(res, await ctx.admin.listProjectImages(projectId));
    }),

    addProjectImage: asyncHandler(async (req, res) => {
      const { projectId } = projectIdParamSchema.parse(req.params);
      const parsed = projectImageInputSchema.parse(req.body);
      sendCreated(
        res,
        await ctx.admin.addProjectImage(projectId, parsed, actor(req))
      );
    }),

    deleteProjectImage: asyncHandler(async (req, res) => {
      const { projectId, imageId } = projectImageParamSchema.parse(req.params);
      await ctx.admin.deleteProjectImage(projectId, imageId, actor(req));
      sendSuccess(res, { deleted: true, id: imageId });
    })
  };
}
