import express, { type Express } from 'express';
import cors from 'cors';
import { config } from './config.js';
import { errorHandler, notFoundHandler } from './errors/error-handler.js';
import { healthRouter } from './routes/health.routes.js';

// Builds the Express app without listening, so tests can import it with supertest.
export function createApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json());

  app.use(healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
