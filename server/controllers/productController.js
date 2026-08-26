import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import slugify from 'slugify';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const getProducts = asyncHandler(async (req, res) => {
  const { category, brand, minPrice, maxPrice, search, rating, sort, page = 1, limit = 10, inStock } = req.query;
  const query = {};

  if (category) query.category = category;
  if (brand) query.brand = brand;
  if (search) query.name = { $regex: search, $options: 'i' };
  if (rating) query.ratings = { $gte: Number(rating) };
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (minPrice || maxPrice) query.price = {};
  if (minPrice) query.price.$gte = Number(minPrice);
  if (maxPrice) query.price.$lte = Number(maxPrice);

  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { price: 1 };
  if (sort === 'price_desc') sortOption = { price: -1 };
  if (sort === 'popular') sortOption = { numReviews: -1 };
  if (sort === 'best_rated') sortOption = { ratings: -1 };

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  res.json({ success: true, count, page: Number(page), pages: Math.ceil(count / limit), data: products });
});

const getProductById = asyncHandler(async (req, res) => {
  let product;

  if (mongoose.isValidObjectId(req.params.id)) {
    product = await Product.findById(req.params.id).lean();
  }

  if (!product) {
    product = await Product.findOne({ slug: req.params.id }).lean();
  }

  if (product) {
    res.json({ success: true, data: product });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(8).lean();
  res.json({ success: true, data: products });
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({ category: req.params.cat }).lean();
  res.json({ success: true, data: products });
});

const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { name, description, price, discountPrice, category, brand, stock, images, tags, isFeatured } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    discountPrice,
    category,
    brand,
    stock,
    images,
    tags,
    isFeatured
  });

  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updates = req.body;
  if (updates.name) updates.slug = slugify(updates.name, { lower: true, strict: true });

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json({ success: true, data: updatedProduct });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});

export {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
};  