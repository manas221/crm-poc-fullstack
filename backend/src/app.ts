import express, { type Express } from 'express';
import cors from 'cors';
import { config } from './config.js';

// Builds the Express app without listening, so tests can import it with supertest.
export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json());
  return app;
}
