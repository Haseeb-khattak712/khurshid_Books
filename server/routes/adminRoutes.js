import express from 'express';
import {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  getUsers,
  deleteUser
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect, admin);
router.get('/dashboard', getDashboardStats);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

export default router;
