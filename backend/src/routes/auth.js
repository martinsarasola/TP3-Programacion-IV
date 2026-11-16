import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPool } from '../config/db.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const emailValidation = () => body('email').isString().bail().trim().isLength({ max: 254 }).isEmail().withMessage('Email inválido').normalizeEmail();
const passwordValidation = () => body('password').isString().bail().custom(value => Buffer.byteLength(value, 'utf8') >= 8 && Buffer.byteLength(value, 'utf8') <= 72).withMessage('La contraseña debe tener entre 8 y 72 bytes');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos inválidos', details: errors.array().map(({ path, msg }) => ({ field: path, message: msg })) });
  return next();
}

router.post('/register', [
  body('nombre').isString().bail().trim().isLength({ min: 1, max: 100 }).withMessage('Nombre inválido'),
  emailValidation(), passwordValidation(),
], validate, async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const [result] = await getPool().execute('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', [nombre, email, hash]);
    return res.status(201).json({ user: { id: result.insertId, nombre, email } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'No se pudo registrar el usuario' });
    return next(error);
  }
});

router.post('/login', [emailValidation(), passwordValidation()], validate, async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(503).json({ error: 'Autenticación no disponible' });
    const [rows] = await getPool().execute('SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?', [req.body.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({}, process.env.JWT_SECRET, { algorithm: 'HS256', subject: String(user.id), expiresIn: '4h' });
    return res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));

export default router;
