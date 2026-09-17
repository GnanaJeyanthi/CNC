import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { createReview, getWorkshopReviews, deleteReview } from '../controllers/reviewController.js';

const storage = multer.memoryStorage();
const uploadReviewPhoto = multer({ storage }).single('photo');

const router = express.Router();

router.get('/:workshopId',            getWorkshopReviews);
router.post('/:workshopId', protect,  uploadReviewPhoto, createReview);
router.delete('/:reviewId', protect,  deleteReview);

export default router;
