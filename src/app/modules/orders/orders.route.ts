import { Router } from 'express';
import { ordersController } from './orders.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

const router = Router();

router.post('/', auth(USER_ROLE.admin), ordersController.createOrders);
router.patch('/:id', ordersController.updateOrders);
router.delete('/:id', ordersController.deleteOrders);
router.get('/my-orders', auth(USER_ROLE.user), ordersController.getMyOrders);
router.get('/:id', ordersController.getOrdersById);
router.get('/', ordersController.getAllOrders);

export const ordersRoutes = router;
