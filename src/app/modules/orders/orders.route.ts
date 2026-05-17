
import { Router } from 'express';
import { ordersController } from './orders.controller';

const router = Router();

router.post('/', ordersController.createOrders);
router.patch('/:id', ordersController.updateOrders);
router.delete('/:id', ordersController.deleteOrders);
router.get('/:id', ordersController.getOrdersById);
router.get('/', ordersController.getAllOrders);

export const ordersRoutes = router;