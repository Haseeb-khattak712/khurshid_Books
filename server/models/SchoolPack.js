import mongoose from 'mongoose';

const schoolPackItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const schoolPackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    items: [schoolPackItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SchoolPack = mongoose.model('SchoolPack', schoolPackSchema);
export default SchoolPack;