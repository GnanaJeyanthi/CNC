import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCreatorOrders, updateOrderStatus, createOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/creator/:id', protect, getCreatorOrders);
router.patch('/:id/status', protect, updateOrderStatus);

export default router;
