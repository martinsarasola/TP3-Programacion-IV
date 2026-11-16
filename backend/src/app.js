import express from 'express';
import cors from 'cors';
import passport from 'passport';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import vehicleRouter from './routes/vehiculos.js';
import driverRouter from './routes/conductores.js';
import { configurePassport } from './config/passport.js';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
configurePassport(passport);
app.use(passport.initialize());
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/vehiculos', vehicleRouter);
app.use('/api/conductores', driverRouter);
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un registro con un dato único' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'El recurso tiene viajes asociados' });
  console.error('Request failed:', { code: typeof err.code === 'string' ? err.code : 'UNKNOWN' });
  return res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
