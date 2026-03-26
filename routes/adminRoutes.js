import express from 'express';
import {
  createHostel,
  updateHostel,
  deleteHostel,
  getHostels as getAdminHostels
} from '../controllers/hostelController.js';
import {
  getInquiries,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validation.js';
import { hostelSchema } from '../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Hostel management
router.get('/hostels', getAdminHostels);
router.post('/hostels', validate(hostelSchema), createHostel);
router.put('/hostels/:id', validate(hostelSchema), updateHostel);
router.delete('/hostels/:id', deleteHostel);

// Inquiry management
router.get('/inquiries', getInquiries);
router.patch('/inquiries/:id/status', updateInquiryStatus);

export default router;