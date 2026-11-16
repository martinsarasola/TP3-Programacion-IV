import { Strategy, ExtractJwt } from 'passport-jwt';
import { getPool } from './db.js';

export function configurePassport(passport) {
  passport.use(new Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: (_req, _token, done) => {
      if (!process.env.JWT_SECRET) return done(new Error('JWT secret is not configured'));
      return done(null, process.env.JWT_SECRET);
    },
    algorithms: ['HS256'],
  }, async (payload, done) => {
    try {
      if (typeof payload.sub !== 'string' || !/^[1-9]\d*$/.test(payload.sub) || !Number.isSafeInteger(Number(payload.sub))) return done(null, false);
      const [rows] = await getPool().execute('SELECT id, nombre, email FROM usuarios WHERE id = ?', [Number(payload.sub)]);
      return done(null, rows[0] || false);
    } catch (error) {
      return done(error);
    }
  }));
}
