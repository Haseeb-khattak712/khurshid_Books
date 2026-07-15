import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const revenueToday = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfToday }, isPaid: true } },
    { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
  ]);
  const revenueThisMonth = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        isPaid: true
      }
    },
    { $group: { _id: null, revenue: { $sum: '$totalPrice' } } }
  ]);

  const monthlyRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 }
  ]);

  res.json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      totalUsers,
      revenueToday: revenueToday[0]?.revenue || 0,
      revenueThisMonth: revenueThisMonth[0]?.revenue || 0,
      monthlyRevenue
    }
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, count: orders.length, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = req.body.status || order.status;
  if (order.status === 'delivered') order.isDelivered = true;
  const updatedOrder = await order.save();

  res.json({ success: true, data: updatedOrder });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

export { getDashboardStats, getOrders, updateOrderStatus, getUsers, deleteUser };
