import { Router } from 'express';
import type { AppContext } from '../context';
import { createPublicController } from '../controllers/public.controller';
import { rateLimiter } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import {
  contactMessageSchema,
  courseRegistrationSchema,
  quoteRequestSchema
} from '../validators/public';

const passThrough = (
  _req: unknown,
  _res: unknown,
  next: () => void
): void => next();

export function createPublicRouter(ctx: AppContext, enableRateLimits: boolean): Router {
  const router = Router();
  const controller = createPublicController(ctx);

  const submissionLimiter = enableRateLimits
    ? rateLimiter({
        windowMs: 10 * 60 * 1000,
        limit: 10,
        message:
          'Too many submissions from this connection. Please wait a few minutes and try again.'
      })
    : passThrough;

  router.get('/health', controller.healthCheck);

  router.get('/site', controller.getSettings);
  router.get('/services', ...controller.listServices);
  router.get('/services/:slug', controller.getService);
  router.get('/courses', controller.listCourses);
  router.get('/courses/:slug', controller.getCourse);
  router.get('/projects', controller.listProjects);
  router.get('/projects/:slug', controller.getProject);
  router.get('/products', ...controller.listProducts);
  router.get('/products/:slug', controller.getProduct);
  router.get('/staff', controller.listStaff);

  router.post(
    '/quotes',
    submissionLimiter,
    validateBody(quoteRequestSchema),
    controller.createQuote
  );
  router.post(
    '/contact',
    submissionLimiter,
    validateBody(contactMessageSchema),
    controller.createContact
  );
  router.post(
    '/course-registrations',
    submissionLimiter,
    validateBody(courseRegistrationSchema),
    controller.createRegistration
  );

  return router;
}
