import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createRazorpayOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// POST /api/payments/create-order  — create a Razorpay order for a product
router.post('/create-order', protect, createRazorpayOrder);

// POST /api/payments/verify  — verify payment signature & finalize order in DB
router.post('/verify', protect, verifyPayment);

export default router;
