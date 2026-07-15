import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

const createReview = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { rating, title, comment } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = await Review.findOne({ user: req.user._id, product: product._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed by user');
  }

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating,
    title,
    comment
  });

  const reviews = await Review.find({ product: product._id });
  product.numReviews = reviews.length;
  product.ratings = Number((reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1));
  await product.save();

  res.status(201).json({ success: true, data: review });
});

const getReviewsByProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
  res.json({ success: true, count: reviews.length, data: reviews });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();
  res.json({ success: true, message: 'Review removed' });
});

export { createReview, getReviewsByProduct, deleteReview };
