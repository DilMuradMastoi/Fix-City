import { Router } from 'express';
import {
  getAdminStats,
  getAdminUsers,
  getAdminReports,
  updateReportStatus,
  updateReportPriority,
  deleteAdminReport,
} from '../controllers/adminController';
import { protect } from '../middleware/authMiddleware';
import { adminOnly } from '../middleware/adminMiddleware';

const router = Router();

// All admin routes require token authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/reports', getAdminReports);
router.put('/reports/:id/status', updateReportStatus);
router.put('/reports/:id/priority', updateReportPriority);
router.delete('/reports/:id', deleteAdminReport);

export default router;
