import express from 'express';
import { handleChatMessage, handleQuickActions } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/message', handleChatMessage);
router.get('/quick-actions', handleQuickActions);

export default router;
