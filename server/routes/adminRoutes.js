import express from 'express';
import {
  getDashboardStats,
  getOrders,
  updateOrderStatus,
  getUsers,
  deleteUser
} from '../controllers/adminController.js';
import {protect,admin} from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);
router.get('/dashboard', getDashboardStats);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

export default router;
