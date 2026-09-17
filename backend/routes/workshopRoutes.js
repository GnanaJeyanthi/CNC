import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadThumbnail, uploadRecording, uploadMaterial } from '../config/cloudinary.js';
import {
  createWorkshop, getCreatorWorkshops, getWorkshop, updateWorkshop, deleteWorkshop,
  scheduleWorkshop, startWorkshop, endWorkshop,
  uploadRecordingHandler, uploadMaterialHandler, deleteMaterial,
  getParticipants, getAllWorkshops, joinWorkshop,
  // New feature endpoints
  joinWaitlist, leaveWaitlist, checkWaitlist,
  leaveWorkshop,
  publishReplay, getReplay,
  getEffectivePriceAPI,
} from '../controllers/workshopController.js';

const router = express.Router();

const safeUpload = (middleware) => (req, res, next) => {
  try {
    middleware(req, res, (err) => {
      if (err) console.warn('Upload middleware warning:', err.message || err);
      next();
    });
  } catch (syncErr) {
    console.warn('Upload middleware sync warning:', syncErr.message || syncErr);
    next();
  }
};

// ── Public ─────────────────────────────────────────────────────────────────────
router.get('/', getAllWorkshops);
router.get('/:id', getWorkshop);
router.get('/:id/price', getEffectivePriceAPI);

// ── Creator ─────────────────────────────────────────────────────────────────────
router.post('/',           protect, requireRole('Creator', 'Admin'), safeUpload(uploadThumbnail), createWorkshop);
router.get('/creator/:id', protect, getCreatorWorkshops);
router.put('/:id',         protect, requireRole('Creator', 'Admin'), safeUpload(uploadThumbnail), updateWorkshop);
router.delete('/:id',      protect, requireRole('Creator', 'Admin'), deleteWorkshop);
router.patch('/:id/schedule',  protect, requireRole('Creator', 'Admin'), scheduleWorkshop);
router.patch('/:id/start',     protect, requireRole('Creator', 'Admin'), startWorkshop);
router.post('/:id/start',      protect, requireRole('Creator', 'Admin'), startWorkshop);
router.patch('/:id/end',       protect, requireRole('Creator', 'Admin'), endWorkshop);
router.post('/:id/recording',  protect, requireRole('Creator', 'Admin'), uploadRecording, uploadRecordingHandler);
router.post('/:id/materials',  protect, requireRole('Creator', 'Admin'), uploadMaterial, uploadMaterialHandler);
router.delete('/:id/materials/:materialId', protect, requireRole('Creator', 'Admin'), deleteMaterial);

// Feature: Replay Store (creator only)
router.patch('/:id/replay', protect, requireRole('Creator', 'Admin'), publishReplay);

// ── Protected (any auth user) ───────────────────────────────────────────────────
router.get('/:id/participants',  protect, getParticipants);

// Feature: Join / Leave
router.post('/:id/join',         protect, joinWorkshop);
router.delete('/:id/leave',      protect, leaveWorkshop);

// Feature: Waitlist
router.post('/:id/waitlist',     protect, joinWaitlist);
router.delete('/:id/waitlist',   protect, leaveWaitlist);
router.get('/:id/waitlist',      protect, checkWaitlist);

// Feature: Replay access
router.get('/:id/replay',        protect, getReplay);

export default router;
