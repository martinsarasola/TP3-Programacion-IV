import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { idParam, noQuery, validate } from '../middleware/validate.js';
import { vehicleValidation } from '../validators/resources.js';
import { createModel } from '../models/crud.js';
import { createController } from '../controllers/crud.js';

export const vehicleModel = createModel('vehiculos', ['marca','modelo','patente','anio','capacidad_carga']);
const controller=createController(vehicleModel);
const router=Router();
router.use(authenticate);
router.get('/', noQuery, validate, controller.list);
router.get('/:id', noQuery, idParam, validate, controller.get);
router.post('/', noQuery, vehicleValidation, validate, controller.create);
router.put('/:id', noQuery, idParam, vehicleValidation, validate, controller.update);
router.delete('/:id', noQuery, idParam, validate, controller.remove);
export default router;
