import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images');
  res.json({ success: true, data: cart || { items: [] } });
});

const addToCart = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { product: productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += Number(quantity);
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      quantity: Number(quantity),
      price: product.discountPrice || product.price,
      image: '/roots.png'
    });
  }

  await cart.save();
  res.status(201).json({ success: true, data: cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  cart.items[itemIndex].quantity = Number(quantity);
  if (cart.items[itemIndex].quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  }

  await cart.save();
  res.json({ success: true, data: cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== req.params.id);
  await cart.save();
  res.json({ success: true, data: cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({ success: true, data: { items: [] } });
});

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
