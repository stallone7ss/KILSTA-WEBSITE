import { Router } from 'express';
import type { AppContext } from '../context';
import { createAdminController, imageUpload } from '../controllers/admin.controller';
import { createCatalogController } from '../controllers/catalog.controller';
import { authenticate, requirePermission, requireStaff } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  contactUpdateSchema,
  listQuerySchema,
  quoteStatusUpdateSchema,
  quoteUpdateSchema,
  registrationUpdateSchema,
  settingUpdateSchema,
  userRolesUpdateSchema
} from '../validators/admin';

export function createAdminRouter(ctx: AppContext): Router {
  const router = Router();
  const admin = createAdminController(ctx);
  const catalog = createCatalogController(ctx);

  router.use(authenticate(ctx.auth));
  router.use(requireStaff());

  router.get('/me', admin.me);
  router.get('/dashboard', requirePermission('dashboard:read'), admin.dashboard);

  /* -------------------------------- quotes -------------------------------- */
  router.get(
    '/quotes',
    requirePermission('quotes:read'),
    validateQuery(listQuerySchema),
    admin.listQuotes
  );
  router.get('/quotes/:id', requirePermission('quotes:read'), admin.getQuote);
  router.patch(
    '/quotes/:id/status',
    requirePermission('quotes:write'),
    validateBody(quoteStatusUpdateSchema),
    admin.updateQuoteStatus
  );
  router.patch(
    '/quotes/:id',
    requirePermission('quotes:write'),
    validateBody(quoteUpdateSchema),
    admin.updateQuote
  );

  /* ------------------------------- contacts ------------------------------- */
  router.get(
    '/contacts',
    requirePermission('contacts:read'),
    validateQuery(listQuerySchema),
    admin.listContacts
  );
  router.patch(
    '/contacts/:id',
    requirePermission('contacts:write'),
    validateBody(contactUpdateSchema),
    admin.updateContact
  );

  /* ----------------------------- registrations ---------------------------- */
  router.get(
    '/registrations',
    requirePermission('registrations:read'),
    validateQuery(listQuerySchema),
    admin.listRegistrations
  );
  router.patch(
    '/registrations/:id',
    requirePermission('registrations:write'),
    validateBody(registrationUpdateSchema),
    admin.updateRegistration
  );

  /* -------------------------------- services ------------------------------ */
  router.get(
    '/services',
    requirePermission('content:read'),
    validateQuery(listQuerySchema),
    catalog.services.list
  );
  router.post(
    '/services',
    requirePermission('content:write'),
    catalog.services.create
  );
  router.patch(
    '/services/:id',
    requirePermission('content:write'),
    catalog.services.update
  );
  router.delete(
    '/services/:id',
    requirePermission('content:write'),
    catalog.services.remove
  );

  /* -------------------------------- courses ------------------------------- */
  router.get(
    '/courses',
    requirePermission('content:read'),
    validateQuery(listQuerySchema),
    catalog.courses.list
  );
  router.post(
    '/courses',
    requirePermission('content:write'),
    catalog.courses.create
  );
  router.patch(
    '/courses/:id',
    requirePermission('content:write'),
    catalog.courses.update
  );
  router.delete(
    '/courses/:id',
    requirePermission('content:write'),
    catalog.courses.remove
  );

  /* ------------------------------- projects ------------------------------- */
  router.get(
    '/projects',
    requirePermission('content:read'),
    validateQuery(listQuerySchema),
    catalog.projects.list
  );
  router.post(
    '/projects',
    requirePermission('content:write'),
    catalog.projects.create
  );
  router.patch(
    '/projects/:id',
    requirePermission('content:write'),
    catalog.projects.update
  );
  router.delete(
    '/projects/:id',
    requirePermission('content:write'),
    catalog.projects.remove
  );
  router.get(
    '/projects/:projectId/images',
    requirePermission('content:read'),
    catalog.listProjectImages
  );
  router.post(
    '/projects/:projectId/images',
    requirePermission('content:write'),
    catalog.addProjectImage
  );
  router.delete(
    '/projects/:projectId/images/:imageId',
    requirePermission('content:write'),
    catalog.deleteProjectImage
  );

  /* -------------------------------- products ------------------------------ */
  router.get(
    '/products',
    requirePermission('products:read'),
    validateQuery(listQuerySchema),
    catalog.products.list
  );
  router.post(
    '/products',
    requirePermission('products:write'),
    catalog.products.create
  );
  router.patch(
    '/products/:id/stock',
    requirePermission('products:stock'),
    catalog.updateStock
  );
  router.patch(
    '/products/:id',
    requirePermission('products:write'),
    catalog.products.update
  );
  router.delete(
    '/products/:id',
    requirePermission('products:write'),
    catalog.products.remove
  );

  /* ----------------------------- staff profiles --------------------------- */
  router.get(
    '/staff-profiles',
    requirePermission('content:read'),
    validateQuery(listQuerySchema),
    catalog.staffProfiles.list
  );
  router.post(
    '/staff-profiles',
    requirePermission('staff:write'),
    catalog.staffProfiles.create
  );
  router.patch(
    '/staff-profiles/:id',
    requirePermission('staff:write'),
    catalog.staffProfiles.update
  );
  router.delete(
    '/staff-profiles/:id',
    requirePermission('staff:write'),
    catalog.staffProfiles.remove
  );

  /* -------------------------------- settings ------------------------------ */
  router.get('/settings', requirePermission('settings:write'), admin.listSettings);
  router.put(
    '/settings/:key',
    requirePermission('settings:write'),
    validateBody(settingUpdateSchema),
    admin.updateSetting
  );

  /* --------------------------------- users -------------------------------- */
  router.get(
    '/users',
    requirePermission('users:manage'),
    validateQuery(listQuerySchema),
    admin.listUsers
  );
  router.put(
    '/users/:id/roles',
    requirePermission('users:manage'),
    validateBody(userRolesUpdateSchema),
    admin.updateUserRoles
  );

  /* ------------------------------ audit / exports ------------------------- */
  router.get(
    '/activity-logs',
    requirePermission('audit:read'),
    validateQuery(listQuerySchema),
    admin.listActivityLogs
  );
  router.get(
    '/exports/:entity',
    requirePermission('exports:read'),
    validateQuery(listQuerySchema),
    admin.exportCsv
  );

  /* -------------------------------- uploads ------------------------------- */
  router.post(
    '/uploads',
    requirePermission('content:write'),
    imageUpload.single('file'),
    admin.uploadImage
  );

  return router;
}
