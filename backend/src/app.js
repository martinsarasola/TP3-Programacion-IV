import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/health', healthRouter);

export default app;
