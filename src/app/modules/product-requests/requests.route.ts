import { Router } from 'express';
import { requestsController } from './requests.controller';
import validateRequest from '../../middleware/validateRequest';
import { requestValidation } from './requests.validation';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import multer, { memoryStorage } from 'multer';
import parseData from '../../middleware/parseData';

const router = Router();
const upload = multer({ storage: memoryStorage() });

router.post(
  '/',
  auth(USER_ROLE.user),
  validateRequest(requestValidation.requestSchema),
  requestsController.createRequests,
);

router.patch(
  '/resend-quotation/:id',
  auth(USER_ROLE.admin),
  upload.single('image'),
  parseData(),
  validateRequest(requestValidation.reSendQuotationSchema),
  requestsController.updateRequestForResendQuotation,
);

router.patch(
  '/reject-request/:id',
  auth(USER_ROLE.admin),
  requestsController.rejectRequests,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(requestValidation.updateRequestSchema),
  requestsController.updateRequests,
);
router.delete('/:id', auth(USER_ROLE.admin), requestsController.deleteRequests);

router.get('/', auth(USER_ROLE.admin), requestsController.getAllRequests);

router.get(
  '/my-requests',
  auth(USER_ROLE.user),
  requestsController.getMyProductRequests,
);
router.get(
  '/received-quotations',
  auth(USER_ROLE.user),
  requestsController.getMyReceivedQuotations,
);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  requestsController.getRequestsById,
);

export const requestsRoutes = router;
