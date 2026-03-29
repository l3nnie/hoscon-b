import express from 'express';
import multer from 'multer';
import {
  createHostel,
  updateHostel,
  deleteHostel,
  getHostels as getAdminHostels,
  uploadHostelImage
} from '../controllers/hostelController.js';
import {
  getInquiries,
  updateInquiryStatus
} from '../controllers/inquiryController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAdmin, authenticateSession } from '../middleware/authMiddleware.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { hostelSchema, filtersSchema } from '../utils/validators.js';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
    }
  }
});

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateSession);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Hostel management
router.get('/hostels', validateQuery(filtersSchema), getAdminHostels);
router.post('/hostels', validate(hostelSchema), createHostel);
router.put('/hostels/:id', validate(hostelSchema), updateHostel);
router.delete('/hostels/:id', deleteHostel);
router.post('/upload-image', upload.single('image'), uploadHostelImage);

// Inquiry management
router.get('/inquiries', validateQuery(filtersSchema), getInquiries);
router.put('/inquiries/:id/status', updateInquiryStatus);

export default router;
