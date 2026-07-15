import express from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getReviewsByProduct,
  deleteReview
} from '../controllers/reviewController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/:productId',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating is required'),
    body('comment').notEmpty().withMessage('Comment is required')
  ],
  createReview
);
router.get('/:productId', getReviewsByProduct);
router.delete('/:reviewId', protect, deleteReview);

export default router;
