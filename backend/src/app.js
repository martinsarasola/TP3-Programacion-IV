import express from 'express';
import cors from 'cors';
import passport from 'passport';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import { configurePassport } from './config/passport.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
configurePassport(passport);
app.use(passport.initialize());
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  console.error('Request failed:', { code: typeof err.code === 'string' ? err.code : 'UNKNOWN' });
  return res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
