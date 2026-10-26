import express, { type Express, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { env } from './config/env';
import { buildCorsOptions } from './config/cors';
import { buildContext, type CreateAppOptions } from './context';
import { requestId } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimit';
import { createAdminRouter } from './routes/admin.routes';
import { createPublicRouter } from './routes/public.routes';
import { createHealthHandlers } from './controllers/public.controller';
import { errorHandler } from './utils/asyncHandler';
import { sendFailure } from './utils/http';

export function createApp(options: CreateAppOptions = {}): Express {
  const { ctx, enableRateLimits } = buildContext(options);
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', ctx.config.TRUST_PROXY);
  app.locals.ctx = ctx;

  app.use(requestId);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
  app.use(cors(buildCorsOptions(ctx.config)));
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));
  app.use(requestLogger(ctx.logger));

  app.get('/', (_req, res) => {
    res.status(200).json({
      service: 'KILSTA Business & ICT Consultants API',
      version: '1.0.0',
      health: '/health',
      api: '/api/v1'
    });
  });

  // Liveness + readiness. Neither route exposes configuration or secrets.
  const health = createHealthHandlers(ctx);
  app.get('/health', health.healthCheck);
  app.get('/health/ready', health.readiness);

  app.use('/api/v1', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  if (enableRateLimits) {
    app.use(
      '/api/v1',
      rateLimiter({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        message: 'Too many requests. Please wait and try again.'
      })
    );
  }

  app.use('/api/v1/admin', createAdminRouter(ctx));
  app.use('/api/v1', createPublicRouter(ctx, enableRateLimits));

  app.use((_req: Request, res: Response) => {
    sendFailure(res, 404, 'NOT_FOUND', 'The requested endpoint does not exist.');
  });

  app.use(errorHandler(ctx.logger));

  if (ctx.config.isProduction) {
    if (ctx.config.FRONTEND_URL.includes('localhost')) {
      ctx.logger.warn('FRONTEND_URL still points to localhost in production.');
    }
    if (!ctx.config.SUPABASE_URL || !ctx.config.SUPABASE_SECRET_KEY) {
      ctx.logger.warn('Supabase credentials are not configured; admin and data routes will fail.');
    }
  }

  return app;
}

export const appConfig = env;
