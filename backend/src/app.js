import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';

import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminAccountRoutes from './routes/adminAccount.routes.js';
import customerAuthRoutes from './routes/customer-auth.routes.js';
import {
  notFound,
  errorHandler,
} from './middleware/errors.js';

const app = express();

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
  }),
);

app.use(
  express.json({
    limit: '1mb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);

app.use(cookieParser());

app.use(
  morgan(
    env.nodeEnv === 'production'
      ? 'combined'
      : 'dev',
  ),
);

app.use(
  '/uploads',
  express.static(
    path.resolve(env.uploadDir),
    {
      maxAge:
        env.nodeEnv === 'production'
          ? '7d'
          : 0,
    },
  ),
);

app.get(
  '/api/health',
  (_req, res) =>
    res.json({
      ok: true,
      service: 'sharuu-api',
    }),
);

app.use(
  '/api/auth',
  authRoutes,
);

app.use(
  '/api/customer-auth',
  customerAuthRoutes,
);

app.use(
  '/api/admin/account',
  adminAccountRoutes,
);

app.use(
  '/api/admin',
  adminRoutes,
);

app.use(
  '/api',
  publicRoutes,
);

app.use(notFound);
app.use(errorHandler);

export default app;