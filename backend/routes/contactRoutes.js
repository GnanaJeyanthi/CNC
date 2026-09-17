import express from 'express';
import { submitContactForm, getAllContactMessages } from '../controllers/contactController.js';

const router = express.Router();

// Public route to submit message
router.post('/', submitContactForm);

// GET all messages (for admin dashboard / support)
router.get('/', getAllContactMessages);

export default router;
