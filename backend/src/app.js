import express from 'express';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from './config/env.js';
import { healthRouter } from './features/health/health.routes.js';
import { uploadsRouter } from './features/uploads/uploads.routes.js';
import { citizenAuthRouter, adminAuthRouter } from './features/auth/auth.routes.js';
import { complaintRouter, adminComplaintRouter } from './features/complaints/complaint.routes.js';
import { noticeRouter, adminNoticeRouter } from './features/notices/notice.routes.js';
import { schemeRouter, adminSchemeRouter } from './features/schemes/scheme.routes.js';
import { taxRouter, adminTaxRouter } from './features/tax/tax.routes.js';
import { dakhalaRouter, adminDakhalaRouter } from './features/certificates/certificate.routes.js';
import { adminDashboardRouter } from './features/dashboard/dashboard.routes.js';
import { adminUserRouter } from './features/users/user.routes.js';
import {
  notificationRouter,
  adminNotificationRouter,
} from './features/notifications/notification.routes.js';
import { securityHeaders, strictCors, noStore } from './middlewares/security.middleware.js';
import { requestTiming } from './middlewares/request-timing.middleware.js';
import { generalLimiter } from './middlewares/rate-limit.middleware.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  // Behind a reverse proxy in production — trust the first hop so client IPs (for rate
  // limiting) and protocol (for HSTS) are read correctly.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // --- Security & transport ---
  app.use(securityHeaders());
  app.use(strictCors());
  app.use(compression());

  // --- Body parsing with size limits (uploads use multipart via multer, handled per route) ---
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Strip Mongo operator injection ($, .) from request payloads.
  app.use(mongoSanitize());

  // --- Observability ---
  app.use(requestTiming);
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  const apiRouter = express.Router();
  // Sensitive data — never cached by browsers or shared caches.
  apiRouter.use(noStore);
  // Standard app-wide rate ceiling (route-specific stricter limits are applied in routers).
  apiRouter.use(generalLimiter);

  apiRouter.use('/health', healthRouter);
  apiRouter.use('/uploads', uploadsRouter);
  apiRouter.use('/auth', citizenAuthRouter);
  apiRouter.use('/admin', adminAuthRouter);
  apiRouter.use('/complaints', complaintRouter);
  apiRouter.use('/admin/complaints', adminComplaintRouter);
  apiRouter.use('/notices', noticeRouter);
  apiRouter.use('/admin/notices', adminNoticeRouter);
  apiRouter.use('/schemes', schemeRouter);
  apiRouter.use('/admin/schemes', adminSchemeRouter);
  apiRouter.use('/tax', taxRouter);
  apiRouter.use('/admin/tax', adminTaxRouter);
  apiRouter.use('/dakhala', dakhalaRouter);
  apiRouter.use('/admin/dakhala', adminDakhalaRouter);
  apiRouter.use('/admin/dashboard', adminDashboardRouter);
  apiRouter.use('/admin/users', adminUserRouter);
  apiRouter.use('/notifications', notificationRouter);
  apiRouter.use('/admin/notifications', adminNotificationRouter);
  app.use(`/api/${env.API_VERSION}`, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
