import express from 'express';
import {
  getHostels,
  getHostelBySlug,
  getFeaturedHostels,
  getNearbyHostels
} from '../controllers/hostelController.js';
import { validateQuery } from '../middleware/validation.js';
import { filtersSchema } from '../utils/validators.js';

const router = express.Router();

router.get('/', validateQuery(filtersSchema), getHostels);
router.get('/featured', getFeaturedHostels);
router.get('/nearby', getNearbyHostels);
router.get('/:slug', getHostelBySlug);

export default router;