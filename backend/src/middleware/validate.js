import { validationResult, query, param } from 'express-validator';

export const noQuery = query().custom(value => Object.keys(value).length === 0).withMessage('No se admiten parámetros de consulta');
export const idParam = param('id').isInt({ min: 1, max: 4294967295 }).withMessage('ID inválido');
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: 'Datos inválidos', details: errors.array().map(({ path, msg }) => ({ field: path || 'query', message: msg })) });
  next();
}
