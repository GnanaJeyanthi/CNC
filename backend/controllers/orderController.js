import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Participant from '../models/Participant.js';
import Workshop from '../models/Workshop.js';
import Notification from '../models/Notification.js';
import crypto from 'crypto';
import { emitToUser } from '../utils/socket.js';

// Create a new order (Purchase Product / Workshop / Replay / Gift)
export const createOrder = async (req, res) => {
  try {
    let { items, productId, quantity, giftEmail } = req.body;

    if (productId) {
      items = [{ itemModel: 'Product', itemId: productId, quantity }];
    }

    let totalAmount = 0;
    const processedItems = [];
    let creatorId = null;

    for (const item of items) {
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

      } else if (item.itemModel === 'Workshop') {
        const workshop = await Workshop.findById(item.itemId);
        if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

        const isGift = !!(giftEmail && giftEmail.trim());

        if (!isGift) {
          const existing = await Participant.findOne({ workshopId: workshop._id, userId: req.user._id });
          if (existing) return res.status(400).json({ message: `Already joined ${workshop.title}` });
        }

        const participantCount = await Participant.countDocuments({ workshopId: workshop._id });
        if (participantCount >= workshop.maxParticipants) {
          return res.status(400).json({ message: `${workshop.title} is full` });
        }

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
          const giftToken = crypto.randomBytes(24).toString('hex');
          await Participant.create({
            workshopId: workshop._id,
            userId: req.user._id,
            giftedByUserId: req.user._id,
            giftEmail: giftEmail.trim().toLowerCase(),
            giftToken,
            giftClaimed: false,
          });
          await Notification.create({
            userId: req.user._id,
            type: 'order_confirmed',
            title: `Gift sent for "${workshop.title}"!`,
            message: `Your gift workshop ticket has been sent to ${giftEmail}.`,
            link: `/workshops/${workshop._id}`,
          });
        } else {
          await Participant.create({ workshopId: workshop._id, userId: req.user._id });
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
      paymentStatus: 'Paid',
      orderStatus: 'Order Confirmed',
      status: 'Order Confirmed',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get orders for creator's products (Authenticated Creator)
export const getCreatorOrders = async (req, res) => {
  try {
    const creatorId = req.params.id || req.user._id;

    // Enforce authorization: creators can only view their own orders
    if (creatorId.toString() !== req.user._id.toString() && req.user.role?.toLowerCase() === 'creator') {
      return res.status(403).json({ message: 'Not authorized to view these orders' });
    }

    const targetCreatorId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    const query = { creatorId: targetCreatorId };
    if (req.query.status) {
      query.$or = [{ orderStatus: req.query.status }, { status: req.query.status }];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('buyerId', 'name email')
        .populate('items.itemId', 'title images price')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Valid Order Lifecycle Status transitions
const VALID_TRANSITIONS = {
  'Order Confirmed': ['Preparing', 'Cancelled'],
  'Preparing': ['Shipped', 'Cancelled'],
  'Shipped': ['Out for Delivery', 'Cancelled'],
  'Out for Delivery': ['Delivered', 'Cancelled'],
  'Delivered': ['Customer Confirmed Received'],
  'paid': ['Preparing', 'Order Confirmed'],
};

// Creator updates Order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    if (!newStatus) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email')
      .populate('items.itemId', 'title images price');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this order' });
    }

    const currentStatus = order.orderStatus || order.status || 'Order Confirmed';
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus) && newStatus !== currentStatus) {
      return res.status(400).json({
        message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed next step: ${allowed.join(', ') || 'None'}`
      });
    }

    order.orderStatus = newStatus;
    order.status = newStatus;
    await order.save();

    const shortOrderId = order._id.toString().slice(-8).toUpperCase();
    let notifType = 'ORDER_CONFIRMED';
    let notifTitle = `Order #${shortOrderId} Status Updated`;
    let notifMsg = `Your order #${shortOrderId} status is now: ${newStatus}`;

    if (newStatus === 'Preparing') {
      notifType = 'ORDER_PREPARING';
      notifTitle = `Order #${shortOrderId} is being prepared`;
      notifMsg = `Your order #${shortOrderId} is being prepared by the creator.`;
    } else if (newStatus === 'Shipped') {
      notifType = 'ORDER_SHIPPED';
      notifTitle = `Order #${shortOrderId} has been shipped`;
      notifMsg = `Your order #${shortOrderId} has been shipped.`;
    } else if (newStatus === 'Out for Delivery') {
      notifType = 'ORDER_OUT_FOR_DELIVERY';
      notifTitle = `Order #${shortOrderId} is out for delivery`;
      notifMsg = `Your order #${shortOrderId} is out for delivery!`;
    } else if (newStatus === 'Delivered') {
      notifType = 'ORDER_DELIVERED';
      notifTitle = `Order #${shortOrderId} has been delivered`;
      notifMsg = `Your order #${shortOrderId} has been delivered. Please confirm receipt!`;
    }

    // Persistent Notification for Customer
    const buyerNotif = await Notification.create({
      userId: order.buyerId._id || order.buyerId,
      senderId: req.user._id,
      orderId: order._id,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      link: '/dashboard/user',
    });

    // Real-time Socket Event to Customer
    emitToUser(order.buyerId._id || order.buyerId, 'order_status_updated', {
      order,
      notification: buyerNotif,
    });

    res.json({ success: true, order, notification: buyerNotif });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Customer confirms order received
export const confirmOrderReceived = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email')
      .populate('items.itemId', 'title images price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify logged in customer owns the order
    if (order.buyerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this order' });
    }

    const currentStatus = order.orderStatus || order.status;
    if (currentStatus !== 'Delivered' && currentStatus !== 'shipped' && currentStatus !== 'completed') {
      return res.status(400).json({ message: `Cannot confirm receipt until order is Delivered (current status: ${currentStatus})` });
    }

    if (order.customerReceived || currentStatus === 'Customer Confirmed Received') {
      return res.status(400).json({ message: 'Order receipt already confirmed' });
    }

    order.orderStatus = 'Customer Confirmed Received';
    order.status = 'Customer Confirmed Received';
    order.customerReceived = true;
    order.customerReceivedAt = new Date();
    await order.save();

    const shortOrderId = order._id.toString().slice(-8).toUpperCase();
    const customerName = req.user.name || 'Customer';

    // Persistent Notification for Creator
    const creatorNotif = await Notification.create({
      userId: order.creatorId,
      senderId: req.user._id,
      orderId: order._id,
      type: 'ORDER_RECEIVED_CONFIRMED',
      title: 'Order Received Confirmation',
      message: `${customerName} has confirmed that order #${shortOrderId} was received successfully!`,
      link: '/dashboard/creator',
    });

    // Real-time Socket Event to Creator
    emitToUser(order.creatorId, 'customer_confirmed_received', {
      order,
      notification: creatorNotif,
    });

    res.json({
      success: true,
      order,
      message: 'Order receipt confirmed successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for logged-in buyer (Order History)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('items.itemId', 'title images price')
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

