import { Router } from 'express';
import { moneyTransferCompanyController } from './moneyTransferCompany.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { MoneyTransferCompanyValidation } from './moneyTransferCompany.validation';
import validateRequest from '../../middleware/validateRequest';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.admin),
  validateRequest(
    MoneyTransferCompanyValidation.createMoneyTransferCompanyValidationSchema,
  ),
  moneyTransferCompanyController.createMoneyTransferCompany,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(
    MoneyTransferCompanyValidation.updateMoneyTransferCompanyValidationSchema,
  ),
  moneyTransferCompanyController.updateMoneyTransferCompany,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin),
  moneyTransferCompanyController.deleteMoneyTransferCompany,
);
router.get('/:id', moneyTransferCompanyController.getMoneyTransferCompanyById);
router.get('/', moneyTransferCompanyController.getAllMoneyTransferCompany);

export const moneyTransferCompanyRoutes = router;
