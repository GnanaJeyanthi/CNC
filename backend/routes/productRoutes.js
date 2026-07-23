import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadProductImages } from '../config/cloudinary.js';
import { createProduct, getCreatorProducts, updateProduct, deleteProduct, getAllProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', protect, requireRole('Creator', 'Admin'), uploadProductImages, createProduct);
router.get('/:id', getProductById);
router.get('/creator/:id', protect, getCreatorProducts);
router.put('/:id', protect, requireRole('Creator', 'Admin'), uploadProductImages, updateProduct);
router.delete('/:id', protect, requireRole('Creator', 'Admin'), deleteProduct);

export default router;
