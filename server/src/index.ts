import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info('KILSTA API listening', {
    port: env.PORT,
    environment: env.NODE_ENV,
    databaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY),
    emailProvider: env.EMAIL_PROVIDER
  });
});

// Render terminates connections after a period; keep the server's keep-alive
// slightly shorter to avoid race conditions.
server.keepAliveTimeout = 61_000;
server.headersTimeout = 65_000;

function shutdown(signal: string): void {
  logger.info('Shutting down', { signal });
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason)
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { reason: error.message });
  shutdown('uncaughtException');
});
