import { Router } from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  getMyReports,
  toggleUpvote,
} from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getReports);
router.get('/user/my-reports', protect, getMyReports);
router.get('/:id', getReportById);

// Protected routes
router.post('/', protect, createReport);
router.put('/:id', protect, updateReport);
router.delete('/:id', protect, deleteReport);
router.put('/:id/upvote', protect, toggleUpvote);

export default router;
