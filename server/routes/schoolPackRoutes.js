import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getSchoolPacks,
  getSchoolPackById,
  createSchoolPack,
  updateSchoolPack,
  deleteSchoolPack
} from '../controllers/schoolPackController.js';

const router = express.Router();

router.get('/', getSchoolPacks);
router.get('/:id', getSchoolPackById);
router.post('/', protect, admin, createSchoolPack);
router.put('/:id', protect, admin, updateSchoolPack);
router.delete('/:id', protect, admin, deleteSchoolPack);

export default router;