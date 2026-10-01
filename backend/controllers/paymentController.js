import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import { emitToUser } from '../utils/socket.js';

// Helper to check if Razorpay keys are configured
function hasValidCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return false;
  if (keyId.includes('YOUR_KEY') || keySecret.includes('YOUR_KEY')) return false;
  return true;
}

// ── Razorpay instance ─────────────────────────────────────────────────────────
function getRazorpay() {
  if (!hasValidCredentials()) {
    throw new Error('Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ── POST /api/payments/create-order ──────────────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId).populate('creatorId', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} item(s) left in stock` });
    }

    const totalAmount  = product.price * quantity;
    const amountPaise  = Math.round(totalAmount * 100);

    if (hasValidCredentials()) {
      try {
        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create({
          amount:   amountPaise,
          currency: 'INR',
          receipt:  `receipt_${Date.now()}`,
          notes: {
            productId:   productId.toString(),
            productName: product.title,
            buyerId:     req.user._id.toString(),
            quantity:    quantity.toString(),
          },
        });

        return res.json({
          razorpayOrderId: razorpayOrder.id,
          amount:          amountPaise,
          currency:        'INR',
          key:             process.env.RAZORPAY_KEY_ID,
          productId,
          quantity,
          productName:     product.title,
          creatorName:     product.creatorId?.name || 'Creator',
          isMock:          false,
        });
      } catch (rzpErr) {
        console.warn('Razorpay API call failed (using fallback Demo Mode):', rzpErr?.error || rzpErr?.message || rzpErr);
      }
    }

    console.log('Using Demo Razorpay Order fallback...');
    const mockOrderId = `order_demo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.json({
      razorpayOrderId: mockOrderId,
      amount:          amountPaise,
      currency:        'INR',
      key:             process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      productId,
      quantity,
      productName:     product.title,
      creatorName:     product.creatorId?.name || 'Creator',
      isMock:          true,
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    const errorMsg = error?.error?.description || error?.description || error?.message || 'Failed to create order';
    res.status(500).json({ message: errorMsg });
  }
};

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// Verifies Razorpay signature, enforces idempotency, updates stock, creates Order,
// notifies Creator & Buyer via DB and Socket.IO.
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      productId,
      quantity = 1,
    } = req.body;

    const finalPaymentId = razorpayPaymentId || `pay_demo_${Date.now()}`;
    const finalOrderId = razorpayOrderId || `order_demo_${Date.now()}`;

    // ── 1. Idempotency Check: Prevent duplicate order processing ─────────────
    const existingOrder = await Order.findOne({
      $or: [
        { razorpayPaymentId: finalPaymentId },
        { razorpayOrderId: finalOrderId, buyerId: req.user._id, items: { $elemMatch: { itemId: productId } } }
      ]
    }).populate('items.itemId', 'title images price').populate('buyerId', 'name email');

    if (existingOrder) {
      console.log(`ℹ️ Payment callback/retry detected for order: ${existingOrder._id}`);
      return res.json({
        success: true,
        order: existingOrder,
        message: 'Order already processed successfully.',
      });
    }

    // ── 2. Signature Verification ─────────────────────────────────────────────
    const isMockOrder = finalOrderId.startsWith('order_demo_') || razorpaySignature === 'demo_signature' || !hasValidCredentials();

    if (!isMockOrder) {
      const body      = `${finalOrderId}|${finalPaymentId}`;
      const expected  = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expected !== razorpaySignature) {
        return res.status(400).json({ message: 'Payment verification failed: invalid signature' });
      }
    }

    // ── 3. Fetch Product & Validate Stock ────────────────────────────────────
    const product = await Product.findById(productId).populate('creatorId', 'name email');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} item(s) available in stock` });
    }

    // ── 4. Deduct Stock ───────────────────────────────────────────────────────
    product.stock -= quantity;
    await product.save();

    // ── 5. Create Order Record ────────────────────────────────────────────────
    const order = await Order.create({
      buyerId:            req.user._id,
      creatorId:          product.creatorId._id || product.creatorId,
      items: [{
        itemModel: 'Product',
        itemId:    product._id,
        quantity,
        price:     product.price,
      }],
      totalAmount:        product.price * quantity,
      paymentStatus:      'Paid',
      orderStatus:        'Order Confirmed',
      status:             'Order Confirmed',
      razorpayOrderId:    finalOrderId,
      razorpayPaymentId:  finalPaymentId,
      razorpaySignature:  razorpaySignature || 'demo_signature',
      paymentMethod:      isMockOrder ? 'razorpay_demo' : 'razorpay',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'name email')
      .populate('items.itemId', 'title images price');

    const shortOrderId = order._id.toString().slice(-8).toUpperCase();
    const customerName = req.user.name || 'Customer';

    // ── 6. Create Creator Persistent Notification ──────────────────────────────
    const creatorNotif = await Notification.create({
      userId:    product.creatorId._id || product.creatorId,
      senderId:  req.user._id,
      orderId:   order._id,
      productId: product._id,
      type:      'NEW_ORDER',
      title:     'New Order Received',
      message:   `${customerName} has placed an order for "${product.title}" (Qty: ${quantity}, ₹${product.price * quantity}). Payment confirmed.`,
      link:      '/dashboard/creator',
    });

    // ── 7. Create Buyer Persistent Notification ────────────────────────────────
    const buyerNotif = await Notification.create({
      userId:    req.user._id,
      senderId:  product.creatorId._id || product.creatorId,
      orderId:   order._id,
      productId: product._id,
      type:      'ORDER_CONFIRMED',
      title:     `Order #${shortOrderId} Confirmed`,
      message:   `Your payment of ₹${product.price * quantity} for "${product.title}" was successful! Order #${shortOrderId} is confirmed.`,
      link:      '/dashboard/user',
    });

    // ── 8. Emit Real-Time Socket Events ───────────────────────────────────────
    // Real-time alert to Creator
    emitToUser(product.creatorId._id || product.creatorId, 'new_order', {
      order: populatedOrder,
      notification: creatorNotif,
    });

    // Real-time alert to Buyer
    emitToUser(req.user._id, 'payment_success', {
      order: populatedOrder,
      notification: buyerNotif,
    });

    res.json({
      success: true,
      order: populatedOrder,
      message: isMockOrder ? 'Demo Payment completed successfully!' : 'Payment verified and order placed successfully',
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    const errorMsg = error?.error?.description || error?.description || error?.message || 'Payment verification failed';
    res.status(500).json({ message: errorMsg });
  }
};


