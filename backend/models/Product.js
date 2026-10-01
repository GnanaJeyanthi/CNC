import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorName: { type: String },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  attributes: {
    type: Map,
    of: String,
    default: {}
  },
  image: { type: String },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
  }],
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

productSchema.index({ creatorId: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;

