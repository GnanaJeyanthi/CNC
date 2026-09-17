import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDailyStatus,
  submitGameScore,
  getLeaderboard,
  getUserStats,
} from '../controllers/gameController.js';

const router = express.Router();

router.get('/status', protect, getDailyStatus);
router.post('/complete', protect, submitGameScore);
router.get('/leaderboard/:gameId', protect, getLeaderboard);
router.get('/stats', protect, getUserStats);

export default router;
