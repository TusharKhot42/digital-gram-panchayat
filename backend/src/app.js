import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { healthRouter } from './features/health/health.routes.js';
import { citizenAuthRouter, adminAuthRouter } from './features/auth/auth.routes.js';
import { complaintRouter, adminComplaintRouter } from './features/complaints/complaint.routes.js';
import { noticeRouter, adminNoticeRouter } from './features/notices/notice.routes.js';
import { schemeRouter, adminSchemeRouter } from './features/schemes/scheme.routes.js';
import { taxRouter, adminTaxRouter } from './features/tax/tax.routes.js';
import { notFoundMiddleware } from './middlewares/not-found.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: [env.CORS_ORIGIN_CITIZEN, env.CORS_ORIGIN_ADMIN],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  const apiRouter = express.Router();
  apiRouter.use('/health', healthRouter);
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
  app.use(`/api/${env.API_VERSION}`, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
