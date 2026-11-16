import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { idParam, noQuery, validate } from '../middleware/validate.js';
import { driverValidation } from '../validators/resources.js';
import { driverModel } from '../models/resources.js';
import { createController } from '../controllers/crud.js';
import { history, mileage } from '../controllers/viajes.js';

const controller = createController(driverModel);
const router = Router();
router.use(authenticate);
router.get('/', noQuery, validate, controller.list);
router.get('/:id/viajes', noQuery, idParam, validate, history('conductor', driverModel));
router.get('/:id/kilometros', noQuery, idParam, validate, mileage('conductor', driverModel));
router.get('/:id', noQuery, idParam, validate, controller.get);
router.post('/', noQuery, driverValidation, validate, controller.create);
router.put('/:id', noQuery, idParam, driverValidation, validate, controller.update);
router.delete('/:id', noQuery, idParam, validate, controller.remove);
export default router;
