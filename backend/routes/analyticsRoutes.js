import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCreatorAnalytics, getUserDashboardData, getUserAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/creator/:id', protect, getCreatorAnalytics);
router.get('/user',        protect, getUserDashboardData);
router.get('/user/stats',  protect, getUserAnalytics);

export default router;
