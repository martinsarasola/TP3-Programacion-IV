import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { idParam, noQuery, validate } from '../middleware/validate.js';
import { tripValidation } from '../validators/resources.js';
import * as controller from '../controllers/viajes.js';

const router=Router();
router.use(authenticate);
router.get('/', noQuery, validate, controller.list);
router.get('/:id', noQuery, idParam, validate, controller.get);
router.post('/', noQuery, tripValidation, validate, controller.create);
export default router;
