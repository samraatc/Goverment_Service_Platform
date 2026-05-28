/**
 * Vercel Serverless Entry Point
 *
 * @vercel/node compiles this file independently with esbuild, so it does
 * not need to live inside src/ or be covered by the project tsconfig.
 *
 * Pattern:
 *  - Import the pre-configured Express app (app.ts has no app.listen)
 *  - Connect to MongoDB once per Lambda container lifetime (cached)
 *  - Export the handler as default — Vercel wraps it as an HTTP function
 */

import '../src/config/env';
import app from '../src/app';
import connectDB from '../src/config/database';
import { logger } from '../src/utils/logger';
import type { Request, Response } from 'express';

let dbReady = false;

const handler = async (req: Request, res: Response): Promise<void> => {
  if (!dbReady) {
    try {
      await connectDB();
      dbReady = true;
    } catch (err) {
      logger.error(`DB connection failed in serverless handler: ${err}`);
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Database not reachable.',
      });
      return;
    }
  }

  return new Promise<void>((resolve) => {
    app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1], resolve);
  });
};

export default handler;
