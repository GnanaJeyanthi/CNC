import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateCertificate } from '../controllers/certificateController.js';

const router = express.Router();

// GET /api/certificates/:workshopId — stream PDF certificate
router.get('/:workshopId', protect, generateCertificate);

export default router;
