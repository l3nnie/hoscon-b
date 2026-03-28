import express from 'express';
import {
  login,
  register,
  changePassword,
  logout,
  verifySession
} from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { loginSchema } from '../utils/validators.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), login);
router.get('/verify', verifySession);

// Protected routes (require authentication)
router.use(authenticateSession);
router.post('/register', register);
router.post('/change-password', changePassword);
router.post('/logout', logout);

export default router;