import type { AppConfig } from './config/env';
import type { Logger } from './utils/logger';
import type { AuthGateway } from './services/auth.service';
import type { AdminService } from './services/admin.service';
import type { ContentService } from './services/content.service';
import type { EmailService } from './services/email.service';
import type { SubmissionService } from './services/submission.service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';
import { env } from './config/env';
import { logger as defaultLogger } from './utils/logger';
import { getSupabaseAdmin, getSupabaseAuthClient } from './config/supabase';
import { createEmailService } from './services/email.service';
import { createAuthGateway } from './services/auth.service';
import { createContentService } from './services/content.service';
import { createSubmissionService } from './services/submission.service';
import { createAdminService } from './services/admin.service';

export interface AppContext {
  config: AppConfig;
  logger: Logger;
  getDb(): SupabaseClient<Database>;
  getAuthClient(): SupabaseClient<Database>;
  auth: AuthGateway;
  email: EmailService;
  content: ContentService;
  submissions: SubmissionService;
  admin: AdminService;
}

export interface CreateAppOptions {
  config?: AppConfig;
  logger?: Logger;
  db?: SupabaseClient<Database>;
  authClient?: SupabaseClient<Database>;
  auth?: AuthGateway;
  email?: EmailService;
  content?: ContentService;
  submissions?: SubmissionService;
  admin?: AdminService;
  enableRateLimits?: boolean;
}

export interface BuiltApp {
  ctx: AppContext;
  enableRateLimits: boolean;
}

export function buildContext(options: CreateAppOptions = {}): BuiltApp {
  const config = options.config ?? env;
  const logger = options.logger ?? defaultLogger;
  const getDb = () => options.db ?? getSupabaseAdmin();
  const getAuthClient = () => options.authClient ?? getSupabaseAuthClient();
  const email = options.email ?? createEmailService(config, logger);
  const auth = options.auth ?? createAuthGateway(getAuthClient, getDb, logger);

  const ctx: AppContext = {
    config,
    logger,
    getDb,
    getAuthClient,
    auth,
    email,
    content: options.content ?? createContentService(getDb, logger),
    submissions:
      options.submissions ?? createSubmissionService({ getDb, email, config, logger }),
    admin: options.admin ?? createAdminService(getDb, logger)
  };

  return {
    ctx,
    enableRateLimits: options.enableRateLimits ?? config.NODE_ENV !== 'test'
  };
}
