import './config/env';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { ENV } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import v1Routes from './routes/v1';
import { getSitemap, getSitemapIndex, getRobotsTxt } from './controllers/sitemap.controller';

const app = express();

// Security
app.use(
  helmet({
    contentSecurityPolicy: ENV.IS_PRODUCTION,
    crossOriginEmbedderPolicy: ENV.IS_PRODUCTION,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [ENV.CLIENT_URL, ENV.ADMIN_URL];
      if (!origin || allowed.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Core middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(mongoSanitize());
app.use(requestLogger);
app.set('trust proxy', 1);
app.use('/api', apiLimiter);

// SEO
app.get('/robots.txt', getRobotsTxt);
app.get('/sitemap.xml', getSitemap);
app.get('/sitemap-index.xml', getSitemapIndex);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API
app.use(`/api/${ENV.API_VERSION}`, v1Routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
