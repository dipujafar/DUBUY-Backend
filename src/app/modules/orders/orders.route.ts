import { Router } from 'express';
import { ordersController } from './orders.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import parseData from '../../middleware/parseData';
import { memoryStorage } from 'multer';
import multer from 'multer';

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post('/', auth(USER_ROLE.admin), ordersController.createOrders);
router.patch(
  '/:orderId/shipping-status',
  auth(USER_ROLE.super_admin, USER_ROLE.sub_admin, USER_ROLE.admin),
  upload.fields([{ name: 'arrivedImages', maxCount: 10 }]),
  parseData(),
  ordersController.updateShippingStatus,
);
router.patch('/:id', auth(USER_ROLE.admin), ordersController.updateOrders);
router.delete('/:id', auth(USER_ROLE.admin), ordersController.deleteOrders);
router.get('/my-orders', auth(USER_ROLE.user), ordersController.getMyOrders);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.user),
  ordersController.getOrdersById,
);
router.get('/', auth(USER_ROLE.admin), ordersController.getAllOrders);

export const ordersRoutes = router;
