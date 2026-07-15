import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword
} from '../controllers/authController.js';
import{ protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  loginUser
);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/change-password', protect, changePassword);

export default router;
