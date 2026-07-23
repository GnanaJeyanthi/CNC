import Order from '../models/Order.js';
import Product from '../models/Product.js';

import Participant from '../models/Participant.js';
import Workshop from '../models/Workshop.js';

// Create a new order (Purchase Product/Workshop)
export const createOrder = async (req, res) => {
  try {
    let { items, productId, quantity } = req.body;
    
    // Support legacy direct product purchase payload
    if (productId) {
      items = [{ itemModel: 'Product', itemId: productId, quantity }];
    }

    let totalAmount = 0;
    const processedItems = [];
    let creatorId = null; // Assuming single creator per order for simplicity, or we can just pick the first

    for (const item of items) {
      if (item.itemModel === 'Product') {
        const product = await Product.findById(item.itemId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < item.quantity) return res.status(400).json({ message: `Not enough stock for ${product.title}` });
        
        totalAmount += product.price * item.quantity;
        creatorId = product.creatorId;
        processedItems.push({ itemModel: 'Product', itemId: product._id, quantity: item.quantity, price: product.price });
        
        product.stock -= item.quantity;
        await product.save();
      } else if (item.itemModel === 'Workshop') {
        const workshop = await Workshop.findById(item.itemId);
        if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
        
        const existing = await Participant.findOne({ workshopId: workshop._id, userId: req.user._id });
        if (existing) return res.status(400).json({ message: `Already joined ${workshop.title}` });
        
        const participantCount = await Participant.countDocuments({ workshopId: workshop._id });
        if (participantCount >= workshop.maxParticipants) return res.status(400).json({ message: `${workshop.title} is full` });

        totalAmount += workshop.price * item.quantity; // usually quantity 1
        creatorId = workshop.creatorId;
        processedItems.push({ itemModel: 'Workshop', itemId: workshop._id, quantity: item.quantity, price: workshop.price });
        
        await Participant.create({ workshopId: workshop._id, userId: req.user._id });
      }
    }
    
    const order = await Order.create({
      buyerId: req.user._id,
      creatorId, 
      items: processedItems,
      totalAmount,
      status: 'paid'
    });
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for a creator's products
export const getCreatorOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const query = { creatorId: req.params.id, ...statusFilter };
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyerId', 'name email')
        .populate('items.itemId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);
    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
