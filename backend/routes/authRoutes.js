import express from 'express';
import { registerUser, loginUser, getMe, updateProfile, updateCategories, changeEmail, changePassword, deleteAccount } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadProfilePhoto } from '../config/cloudinary.js';

const router = express.Router();

router.post('/register',         registerUser);
router.post('/login',            loginUser);
router.get('/me',                protect, getMe);
router.put('/profile',           protect, uploadProfilePhoto, updateProfile);
router.put('/categories',        protect, updateCategories);
router.put('/change-email',      protect, changeEmail);
router.put('/change-password',   protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;
