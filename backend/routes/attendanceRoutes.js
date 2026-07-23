import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import {
  recordJoin,
  recordLeave,
  getWorkshopParticipants,
  getCreatorAttendanceReport,
  markParticipantStatus,
  getUserAttendanceHistory,
} from '../controllers/attendanceController.js';

const router = express.Router();

// User routes
router.post('/workshops/:id/join-session',  protect, recordJoin);
router.post('/workshops/:id/leave-session', protect, recordLeave);
router.get('/my-history',                   protect, getUserAttendanceHistory);

// Creator routes
router.get('/workshops/:id/participants',   protect, requireRole('Creator', 'Admin'), getWorkshopParticipants);
router.get('/report',                       protect, requireRole('Creator', 'Admin'), getCreatorAttendanceReport);
router.patch('/workshops/:id/mark-status',  protect, requireRole('Creator', 'Admin'), markParticipantStatus);

export default router;
