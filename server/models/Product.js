import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    category: {
      type: String,
      enum: ['Books', 'Notebooks', 'Pens', 'Art Supplies', 'Office Supplies', 'Bags', 'Calculators', 'Geometry', 'Paper Products', 'Gift Items'],
      required: true
    },
    brand: { type: String },
    stock: { type: Number, default: 0 },
    images: [{ type: String }],
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });

export default mongoose.model('Product', productSchema);
