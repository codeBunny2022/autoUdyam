import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/api.js';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', apiRouter);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  return app;
}; 