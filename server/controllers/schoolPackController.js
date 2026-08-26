import asyncHandler from 'express-async-handler';
import SchoolPack from '../models/SchoolPack.js';
import Product from '../models/Product.js';

const getSchoolPacks = asyncHandler(async (req, res) => {
  const { admin, school, limit = 12, skip = 0, q } = req.query;
  const filter = admin === 'true' ? {} : { isActive: true };

  if (school) filter.school = { $regex: new RegExp(school, 'i') };
  if (q) filter.name = { $regex: new RegExp(q, 'i') };

  const packs = await SchoolPack.find(filter)
    .populate('items.product', 'name price image')
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Math.min(Number(limit), 100))
    .lean();

  res.json({ success: true, data: packs });
});

const getSchoolPackById = asyncHandler(async (req, res) => {
  const pack = await SchoolPack.findById(req.params.id)
    .populate('items.product', 'name price image description')
    .lean();
    
  if (!pack) {
    res.status(404);
    throw new Error('School pack not found');
  }
  res.json({ success: true, data: pack });
});

const createSchoolPack = asyncHandler(async (req, res) => {
  const { name, school, grade, academicYear, description, price, discountPrice, items, isActive } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Pack must contain at least one item');
  }

  const productIds = items.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  if (products.length !== productIds.length) {
    res.status(400);
    throw new Error('One or more products not found');
  }

  const pack = await SchoolPack.create({
    name, school, grade, academicYear, description, price, discountPrice, items, isActive
  });

  const populatedPack = await SchoolPack.findById(pack._id).populate('items.product', 'name price image').lean();
  res.status(201).json({ success: true, data: populatedPack });
});

const updateSchoolPack = asyncHandler(async (req, res) => {
  const pack = await SchoolPack.findById(req.params.id);
  if (!pack) {
    res.status(404);
    throw new Error('School pack not found');
  }

  const { name, school, grade, academicYear, description, price, discountPrice, items, isActive } = req.body;

  if (items && items.length === 0) {
    res.status(400);
    throw new Error('Pack must contain at least one item');
  }

  pack.name = name || pack.name;
  pack.school = school || pack.school;
  pack.grade = grade || pack.grade;
  pack.academicYear = academicYear || pack.academicYear;
  if (description !== undefined) pack.description = description;
  if (price !== undefined) pack.price = price;
  if (discountPrice !== undefined) pack.discountPrice = discountPrice;
  if (isActive !== undefined) pack.isActive = isActive;
  if (items) pack.items = items;

  await pack.save();

  const updatedPack = await SchoolPack.findById(pack._id).populate('items.product', 'name price image').lean();
  res.json({ success: true, data: updatedPack });
});

const deleteSchoolPack = asyncHandler(async (req, res) => {
  const pack = await SchoolPack.findById(req.params.id);
  if (!pack) {
    res.status(404);
    throw new Error('School pack not found');
  }

  await pack.deleteOne();
  res.json({ success: true, message: 'School pack deleted' });
});

export {
  getSchoolPacks,
  getSchoolPackById,
  createSchoolPack,
  updateSchoolPack,
  deleteSchoolPack
};
