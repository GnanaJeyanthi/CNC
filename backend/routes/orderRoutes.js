import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCreatorOrders, updateOrderStatus, createOrder, getMyOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/creator/:id', protect, getCreatorOrders);
router.patch('/:id/status', protect, updateOrderStatus);

export default router;
