import express from 'express';
import SchoolPack from '../models/SchoolPack.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/school-packs - Get packs (public)
// Supports optional query params: admin=true, school=<slug>, limit, skip
router.get('/', async (req, res) => {
  try {
    const { admin, school, limit = 12, skip = 0, q } = req.query;
    const filter = admin === 'true' ? {} : { isActive: true };

    if (school) {
      // allow searching by school slug or name
      filter.school = { $regex: new RegExp(school, 'i') };
    }

    if (q) {
      // simple text search on name
      filter.name = { $regex: new RegExp(q, 'i') };
    }

    const packs = await SchoolPack.find(filter)
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 100));

    res.json({
      success: true,
      data: packs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/school-packs/:id - Get single pack
router.get('/:id', async (req, res) => {
  try {
    const pack = await SchoolPack.findById(req.params.id).populate(
      'items.product',
      'name price image description'
    );
    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'School pack not found',
      });
    }
    res.json({
      success: true,
      data: pack,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/school-packs - Create new pack (admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, school, grade, academicYear, description, price, discountPrice, items, isActive } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pack must contain at least one item',
      });
    }

    // Verify all products exist
    const productIds = items.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found',
      });
    }

    const pack = await SchoolPack.create({
      name,
      school,
      grade,
      academicYear,
      description,
      price,
      discountPrice,
      items,
      isActive,
    });

    const populatedPack = await SchoolPack.findById(pack._id).populate(
      'items.product',
      'name price image'
    );

    res.status(201).json({
      success: true,
      data: populatedPack,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT /api/school-packs/:id - Update pack (admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const pack = await SchoolPack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'School pack not found',
      });
    }

    const { name, school, grade, academicYear, description, price, discountPrice, items, isActive } = req.body;

    // Validate items if provided
    if (items && items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pack must contain at least one item',
      });
    }

    pack.name = name || pack.name;
    pack.school = school || pack.school;
    pack.grade = grade || pack.grade;
    pack.academicYear = academicYear || pack.academicYear;
    pack.description = description !== undefined ? description : pack.description;
    pack.price = price !== undefined ? price : pack.price;
    pack.discountPrice = discountPrice !== undefined ? discountPrice : pack.discountPrice;
    pack.isActive = isActive !== undefined ? isActive : pack.isActive;
    if (items) pack.items = items;

    await pack.save();

    const updatedPack = await SchoolPack.findById(pack._id).populate(
      'items.product',
      'name price image'
    );

    res.json({
      success: true,
      data: updatedPack,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/school-packs/:id - Delete pack (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const pack = await SchoolPack.findById(req.params.id);
    if (!pack) {
      return res.status(404).json({
        success: false,
        message: 'School pack not found',
      });
    }

    await pack.deleteOne();
    res.json({
      success: true,
      message: 'School pack deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;