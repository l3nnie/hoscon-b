import express from 'express';
import { createInquiry } from '../controllers/inquiryController.js';
import { validate } from '../middleware/validation.js';
import { inquirySchema } from '../utils/validators.js';

const router = express.Router();

router.post('/', validate(inquirySchema), createInquiry);

export default router;