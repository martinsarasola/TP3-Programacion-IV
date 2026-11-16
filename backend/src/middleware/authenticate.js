import passport from 'passport';

export function authenticate(req, res, next) {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: 'Autenticación no disponible' });
  return passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) return next(error);
    if (!user) return res.status(401).json({ error: 'Autenticación requerida' });
    req.user = user;
    return next();
  })(req, res, next);
}
