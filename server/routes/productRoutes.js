import express from 'express';
import { body } from 'express-validator';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import {protect,admin} from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:cat', getProductsByCategory);
router.get('/:id', getProductById);

router.post(
  '/',
  protect,
  admin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  createProduct
);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
