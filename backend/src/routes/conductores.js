import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { idParam, noQuery, validate } from '../middleware/validate.js';
import { driverValidation } from '../validators/resources.js';
import { createModel } from '../models/crud.js';
import { createController } from '../controllers/crud.js';

export const driverModel = createModel('conductores', ['nombre','apellido','numero_documento','numero_licencia','fecha_alta_licencia','fecha_vencimiento_licencia']);
const controller = createController(driverModel);
const router = Router();
router.use(authenticate);
router.get('/', noQuery, validate, controller.list);
router.get('/:id', noQuery, idParam, validate, controller.get);
router.post('/', noQuery, driverValidation, validate, controller.create);
router.put('/:id', noQuery, idParam, driverValidation, validate, controller.update);
router.delete('/:id', noQuery, idParam, validate, controller.remove);
export default router;
