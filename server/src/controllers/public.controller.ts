import type { Request, Response } from 'express';
import { z } from 'zod';
import type { AppContext } from '../context';
import { sendCreated, sendSuccess } from '../utils/http';
import { asyncHandler } from '../utils/asyncHandler';
import { notFound } from '../utils/errors';
import { validateQuery } from '../middleware/validate';
import type { PublicSiteSettings } from '../services/content.service';

export const publicServiceQuerySchema = z.object({
  category: z.enum(['business', 'ict', 'training']).optional(),
  featured: z.enum(['true', 'false']).optional()
});

export const publicProductQuerySchema = z.object({
  category: z.string().trim().max(80).optional(),
  search: z.string().trim().max(100).optional()
});

export const slugParamSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid identifier.')
});

export function createHealthHandlers(ctx: AppContext) {
  return {
    healthCheck: asyncHandler(async (_req, res) => {
      const startedAt = Date.now();
      let database: 'ok' | 'error' | 'not_configured' = 'not_configured';
      if (ctx.config.SUPABASE_URL && ctx.config.SUPABASE_SECRET_KEY) {
        try {
          const { error } = await ctx
            .getDb()
            .from('site_settings')
            .select('key', { head: true, count: 'exact' })
            .limit(1);
          database = error ? 'error' : 'ok';
        } catch {
          database = 'error';
        }
      }

      const healthy = database !== 'error';
      res.status(200).json({
        status: healthy ? 'ok' : 'degraded',
        service: 'kilsta-api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        checks: {
          database,
          databaseLatencyMs: database === 'not_configured' ? null : Date.now() - startedAt
        }
      });
    }),

    readiness: asyncHandler(async (_req, res) => {
      if (!ctx.config.SUPABASE_URL || !ctx.config.SUPABASE_SECRET_KEY) {
        res.status(503).json({
          status: 'not_ready',
          checks: { database: 'not_configured' }
        });
        return;
      }
      try {
        const { error } = await ctx
          .getDb()
          .from('site_settings')
          .select('key', { head: true, count: 'exact' })
          .limit(1);
        if (error) {
          res.status(503).json({ status: 'not_ready', checks: { database: 'error' } });
          return;
        }
        res.status(200).json({ status: 'ready', checks: { database: 'ok' } });
      } catch {
        res.status(503).json({ status: 'not_ready', checks: { database: 'error' } });
      }
    })
  };
}

export function createPublicController(ctx: AppContext) {
  const health = createHealthHandlers(ctx);
  return {
    listServices: [
      validateQuery(publicServiceQuerySchema),
      asyncHandler(async (_req, res) => {
        const query = res.locals.query as z.infer<typeof publicServiceQuerySchema>;
        const services = await ctx.content.listServices(
          query.category,
          query.featured === 'true'
        );
        sendSuccess(res, services);
      })
    ],

    getService: asyncHandler(async (req: Request, res: Response) => {
      const params = slugParamSchema.parse(req.params);
      sendSuccess(res, await ctx.content.getServiceBySlug(params.slug));
    }),

    listCourses: asyncHandler(async (_req, res) => {
      sendSuccess(res, await ctx.content.listCourses());
    }),

    getCourse: asyncHandler(async (req, res) => {
      const params = slugParamSchema.parse(req.params);
      sendSuccess(res, await ctx.content.getCourseBySlug(params.slug));
    }),

    listProjects: asyncHandler(async (req, res) => {
      const query = z
        .object({
          category: z.enum(['business', 'ict', 'training']).optional(),
          featured: z.enum(['true', 'false']).optional()
        })
        .parse(req.query);
      sendSuccess(
        res,
        await ctx.content.listProjects(query.category, query.featured === 'true')
      );
    }),

    getProject: asyncHandler(async (req, res) => {
      const params = slugParamSchema.parse(req.params);
      sendSuccess(res, await ctx.content.getProjectBySlug(params.slug));
    }),

    listProducts: [
      validateQuery(publicProductQuerySchema),
      asyncHandler(async (_req, res) => {
        const query = res.locals.query as z.infer<typeof publicProductQuerySchema>;
        sendSuccess(res, await ctx.content.listProducts(query));
      })
    ],

    getProduct: asyncHandler(async (req, res) => {
      const params = slugParamSchema.parse(req.params);
      sendSuccess(res, await ctx.content.getProductBySlug(params.slug));
    }),

    listStaff: asyncHandler(async (_req, res) => {
      sendSuccess(res, await ctx.content.listStaff());
    }),

    getSettings: asyncHandler(async (_req, res) => {
      const settings: PublicSiteSettings = await ctx.content.getPublicSettings();
      sendSuccess(res, settings);
    }),

    createQuote: asyncHandler(async (req, res) => {
      const receipt = await ctx.submissions.createQuoteRequest(req.body);
      sendCreated(res, {
        reference: receipt.reference,
        submittedAt: receipt.submittedAt,
        notifications: receipt.notifications,
        message:
          'Your quote request has been received. It is not a quotation yet; our team will review it and respond using your preferred contact method.'
      });
    }),

    createContact: asyncHandler(async (req, res) => {
      const receipt = await ctx.submissions.createContactMessage(req.body);
      sendCreated(res, {
        submittedAt: receipt.submittedAt,
        notifications: receipt.notifications,
        message:
          'Your message has been received. Our team will respond as soon as possible.'
      });
    }),

    createRegistration: asyncHandler(async (req, res) => {
      const receipt = await ctx.submissions.createCourseRegistration(req.body);
      sendCreated(res, {
        reference: receipt.reference,
        submittedAt: receipt.submittedAt,
        notifications: receipt.notifications,
        message:
          'Your training registration has been received. A place is not confirmed until our team contacts you.'
      });
    }),

    ...health,

    // Explicit handlers keep the route table honest about what is public.
    notFound: (_req: Request, _res: Response) => {
      throw notFound('API endpoint not found.');
    }
  };
}
