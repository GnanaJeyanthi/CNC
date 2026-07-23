import Product from '../models/Product.js';
import { cloudinary, uploadBufferToCloudinary } from '../config/cloudinary.js';

// Create product
export const createProduct = async (req, res) => {
  try {
    const { title, description, category, price, stock } = req.body;
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.buffer) {
          try {
            const uploadRes = await uploadBufferToCloudinary(file.buffer, { folder: 'castncart/products' });
            images.push({ url: uploadRes.secure_url, publicId: uploadRes.public_id });
          } catch (e) {
            console.warn('Product image upload error:', e.message);
          }
        }
      }
    }
    const product = await Product.create({
      title, description, category, price, stock,
      images,
      creatorId: req.user._id,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    const products = await Product.find(query).sort({ createdAt: -1 }).limit(20).populate('creatorId', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('creatorId', 'name avatar');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get creator's products
export const getCreatorProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find({ creatorId: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments({ creatorId: req.params.id }),
    ]);
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updates = req.body;
    // If new images uploaded, add them
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        if (file.buffer) {
          try {
            const uploadRes = await uploadBufferToCloudinary(file.buffer, { folder: 'castncart/products' });
            newImages.push({ url: uploadRes.secure_url, publicId: uploadRes.public_id });
          } catch (e) {
            console.warn('Product image upload error:', e.message);
          }
        }
      }
      updates.images = [...(product.images || []), ...newImages];
    }
    Object.assign(product, updates);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Clean up Cloudinary images
    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId);
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
