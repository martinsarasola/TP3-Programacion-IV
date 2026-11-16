import { Router } from 'express';
import { getPool } from '../config/db.js';

const router = Router();
router.get('/', (_req, res) => res.status(200).json({ status: 'ok' }));
router.get('/db', async (_req, res) => {
  try {
    await getPool().query('SELECT 1');
    res.status(200).json({ status: 'ok', mysql: 'available' });
  } catch (error) {
    // Log only the error category and numeric code; driver messages may contain sensitive data.
    console.error('MySQL health check failed:', {
      code: typeof error.code === 'string' ? error.code : 'UNKNOWN',
      errno: typeof error.errno === 'number' ? error.errno : undefined,
    });
    res.status(503).json({ status: 'error', mysql: 'unavailable' });
  }
});

export default router;
