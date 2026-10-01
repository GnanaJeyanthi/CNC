import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCreatorOrders,
  updateOrderStatus,
  createOrder,
  getMyOrders,
  confirmOrderReceived,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/creator-orders', protect, getCreatorOrders);
router.get('/creator/:id', protect, getCreatorOrders);
router.patch('/:id/status', protect, updateOrderStatus);
router.post('/:id/confirm-received', protect, confirmOrderReceived);

export default router;
