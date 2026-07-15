import express from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.post(
  '/add',
  protect,
  [
    body('product').notEmpty().withMessage('Product is required'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be at least 1')
  ],
  addToCart
);
router.put('/update', protect, updateCartItem);
router.delete('/remove/:id', protect, removeCartItem);
router.delete('/clear', protect, clearCart);

export default router;
