import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Participant from '../models/Participant.js';
import Workshop from '../models/Workshop.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';

// Create a new order (Purchase Product / Workshop / Replay / Gift)
export const createOrder = async (req, res) => {
  try {
    let { items, productId, quantity, giftEmail } = req.body;

    // Support legacy direct product purchase payload
    if (productId) {
      items = [{ itemModel: 'Product', itemId: productId, quantity }];
    }

    let totalAmount = 0;
    const processedItems = [];
    let creatorId = null;

    for (const item of items) {
      // ── Product ──────────────────────────────────────────────────────────────
      if (item.itemModel === 'Product') {
        const product = await Product.findById(item.itemId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Not enough stock for ${product.title}` });
        }
        totalAmount += product.price * item.quantity;
        creatorId = product.creatorId;
        processedItems.push({ itemModel: 'Product', itemId: product._id, quantity: item.quantity, price: product.price });
        product.stock -= item.quantity;
        await product.save();

      // ── Workshop (self or gift) ───────────────────────────────────────────────
      } else if (item.itemModel === 'Workshop') {
        const workshop = await Workshop.findById(item.itemId);
        if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

        const isGift = !!(giftEmail && giftEmail.trim());

        if (!isGift) {
          // Self purchase — check not already enrolled
          const existing = await Participant.findOne({ workshopId: workshop._id, userId: req.user._id });
          if (existing) return res.status(400).json({ message: `Already joined ${workshop.title}` });
        }

        const participantCount = await Participant.countDocuments({ workshopId: workshop._id });
        if (participantCount >= workshop.maxParticipants) {
          return res.status(400).json({ message: `${workshop.title} is full` });
        }

        // Effective price (early bird)
        const now = new Date();
        const effectivePrice =
          workshop.earlyBirdPrice != null &&
          workshop.earlyBirdDeadline &&
          now < new Date(workshop.earlyBirdDeadline)
            ? workshop.earlyBirdPrice
            : workshop.price;

        totalAmount += effectivePrice * item.quantity;
        creatorId = workshop.creatorId;
        processedItems.push({ itemModel: 'Workshop', itemId: workshop._id, quantity: item.quantity, price: effectivePrice });

        if (isGift) {
          // Create a placeholder participant for the gift recipient
          const giftToken = crypto.randomBytes(24).toString('hex');
          await Participant.create({
            workshopId: workshop._id,
            userId: req.user._id,  // placeholder — will be reassigned on claim
            giftedByUserId: req.user._id,
            giftEmail: giftEmail.trim().toLowerCase(),
            giftToken,
            giftClaimed: false,
          });
          // Notify the gifter
          await Notification.create({
            userId: req.user._id,
            type: 'order_confirmed',
            title: `Gift sent for "${workshop.title}"!`,
            message: `Your gift workshop ticket has been sent to ${giftEmail}.`,
            link: `/workshops/${workshop._id}`,
          });
        } else {
          await Participant.create({ workshopId: workshop._id, userId: req.user._id });
          // Enrollment notification
          if (workshop.scheduledDate) {
            await Notification.create({
              userId: req.user._id,
              type: 'workshop_reminder',
              title: `Enrolled in "${workshop.title}"`,
              message: `Your workshop is scheduled for ${new Date(workshop.scheduledDate).toLocaleDateString()}.`,
              link: `/workshops/${workshop._id}`,
            });
          }
        }

      // ── Replay purchase ───────────────────────────────────────────────────────
      } else if (item.itemModel === 'Replay') {
        const workshop = await Workshop.findById(item.itemId);
        if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
        if (!workshop.replayPublished) return res.status(400).json({ message: 'Replay not available' });
        totalAmount += workshop.replayPrice * item.quantity;
        creatorId = workshop.creatorId;
        processedItems.push({ itemModel: 'Replay', itemId: workshop._id, quantity: item.quantity, price: workshop.replayPrice });
        await Notification.create({
          userId: req.user._id,
          type: 'order_confirmed',
          title: `Replay purchased: "${workshop.title}"`,
          message: 'You can now watch the replay anytime from the workshop page.',
          link: `/workshops/${workshop._id}`,
        });
      }
    }

    const order = await Order.create({
      buyerId: req.user._id,
      creatorId,
      items: processedItems,
      totalAmount,
      status: 'paid',
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

// Get all orders for the logged-in buyer (Order History)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('items.itemId', 'title images price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
