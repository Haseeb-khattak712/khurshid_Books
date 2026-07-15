import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

const createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((err) => err.msg).join(', '));
  }

  const { orderItems, shippingAddress, paymentMethod } = req.body;
  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingPrice = subtotal >= 1500 ? 0 : 150;
  const taxPrice = Number((subtotal * 0.17).toFixed(2));
  const totalPrice = Number((subtotal + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentMethod !== 'Cash on Delivery',
    paidAt: paymentMethod !== 'Cash on Delivery' ? Date.now() : null
  });

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

export { createOrder, getMyOrders, getOrderById };
