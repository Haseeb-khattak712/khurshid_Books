import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrderById
} from '../controllers/orderController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('orderItems').isArray({ min: 1 }).withMessage('Order items are required'),
    body('shippingAddress.street').notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.province').notEmpty().withMessage('Province is required'),
    body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required')
  ],
  createOrder
);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

export default router;
