import './config/env'; // Load env first
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { ENV } from './config/env';
import connectDB from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import v1Routes from './routes/v1';
import { getSitemap, getSitemapIndex, getRobotsTxt } from './controllers/sitemap.controller';
import { logger } from './utils/logger';

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: ENV.IS_PRODUCTION,
    crossOriginEmbedderPolicy: ENV.IS_PRODUCTION,
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, ENV.ADMIN_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(ENV.COOKIE_SECRET));
app.use(mongoSanitize());

// ─── Request Logger ────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Trust proxy (for Nginx) ───────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─── SEO Routes (served at root level, before API) ────────────────────────────
app.get('/robots.txt', getRobotsTxt);
app.get('/sitemap.xml', getSitemap);
app.get('/sitemap-index.xml', getSitemapIndex);

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use(`/api/${ENV.API_VERSION}`, v1Routes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      logger.info(`API URL: http://localhost:${ENV.PORT}/api/${ENV.API_VERSION}`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err: Error) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err: Error) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

startServer();

export default app;
