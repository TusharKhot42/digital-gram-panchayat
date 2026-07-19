import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { logStartupDiagnostics } from './config/diagnostics.js';
import { logger } from './utils/logger.js';
import { reportError } from './utils/error-reporter.js';

// How long to wait for in-flight requests to finish before forcing exit.
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function bootstrap() {
  await connectDatabase();
  logStartupDiagnostics();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info('Server started', { port: env.PORT, env: env.NODE_ENV, version: env.API_VERSION });
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Shutdown initiated', { signal });

    // Force exit if graceful close hangs (stuck sockets, slow DB).
    const force = setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    force.unref();

    server.close(async () => {
      try {
        await disconnectDatabase();
        logger.info('Shutdown complete');
        process.exit(0);
      } catch (err) {
        reportError(err instanceof Error ? err : new Error(String(err)), { phase: 'shutdown' });
        process.exit(1);
      }
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Last-resort safety nets — report, then shut down cleanly.
  process.on('unhandledRejection', (reason) => {
    reportError(reason instanceof Error ? reason : new Error(String(reason)), {
      type: 'unhandledRejection',
    });
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    reportError(err, { type: 'uncaughtException' });
    shutdown('uncaughtException');
  });

  return server;
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
