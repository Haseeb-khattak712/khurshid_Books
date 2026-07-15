import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  province: { type: String },
  postalCode: { type: String },
  country: { type: String }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    address: addressSchema,
    phone: { type: String },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
