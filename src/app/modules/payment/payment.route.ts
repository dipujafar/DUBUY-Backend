import { Router } from 'express';
import { paymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { paymentValidation } from './payment.validation';

const router = Router();

router.post(
  '/init-payment',
  auth(USER_ROLE.user),
  validateRequest(paymentValidation.createPaymentValidationSchema),
  paymentController.createPaymentInit,
);
router.patch(
    "/accept-payment/:id",
    auth(USER_ROLE.admin),
)
router.patch('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);
router.get('/:id', paymentController.getPaymentById);
router.get('/', paymentController.getAllPayment);

export const paymentRoutes = router;
