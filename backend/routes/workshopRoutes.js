import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { uploadThumbnail, uploadRecording, uploadMaterial } from '../config/cloudinary.js';
import {
  createWorkshop, getCreatorWorkshops, getWorkshop, updateWorkshop, deleteWorkshop,
  scheduleWorkshop, startWorkshop, endWorkshop,
  uploadRecordingHandler, uploadMaterialHandler, deleteMaterial,
  getParticipants, getAllWorkshops, joinWorkshop
} from '../controllers/workshopController.js';

const router = express.Router();

const safeUpload = (middleware) => (req, res, next) => {
  try {
    middleware(req, res, (err) => {
      if (err) {
        console.warn('Upload middleware warning:', err.message || err);
      }
      next();
    });
  } catch (syncErr) {
    console.warn('Upload middleware sync warning:', syncErr.message || syncErr);
    next();
  }
};

router.get('/', getAllWorkshops);
router.post('/', protect, requireRole('Creator', 'Admin'), safeUpload(uploadThumbnail), createWorkshop);
router.get('/creator/:id', protect, getCreatorWorkshops);
router.get('/:id', protect, getWorkshop);
router.put('/:id', protect, requireRole('Creator', 'Admin'), safeUpload(uploadThumbnail), updateWorkshop);
router.delete('/:id', protect, requireRole('Creator', 'Admin'), deleteWorkshop);
router.patch('/:id/schedule', protect, requireRole('Creator', 'Admin'), scheduleWorkshop);
router.patch('/:id/start', protect, requireRole('Creator', 'Admin'), startWorkshop);
router.post('/:id/start', protect, requireRole('Creator', 'Admin'), startWorkshop);
router.patch('/:id/end', protect, requireRole('Creator', 'Admin'), endWorkshop);
router.post('/:id/recording', protect, requireRole('Creator', 'Admin'), uploadRecording, uploadRecordingHandler);
router.post('/:id/materials', protect, requireRole('Creator', 'Admin'), uploadMaterial, uploadMaterialHandler);
router.delete('/:id/materials/:materialId', protect, requireRole('Creator', 'Admin'), deleteMaterial);
router.get('/:id/participants', protect, getParticipants);
router.post('/:id/join', protect, joinWorkshop);

export default router;
