import express from 'express';
import { login, verifyToken } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { loginSchema } from '../utils/validators.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.get('/verify', authenticateToken, verifyToken);

export default router;