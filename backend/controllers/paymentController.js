import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

// ── Razorpay instance (lazy — only created when keys are present) ─────────────
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY')) {
    throw new Error('Razorpay keys not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ── POST /api/payments/create-order ──────────────────────────────────────────
// Creates a Razorpay order for a product purchase.
// Returns: { razorpayOrderId, amount, currency, key, productId, quantity }
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
    const amountPaise  = Math.round(totalAmount * 100); // Razorpay uses paise

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

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount:          amountPaise,
      currency:        'INR',
      key:             process.env.RAZORPAY_KEY_ID,
      productId,
      quantity,
      productName:     product.title,
      creatorName:     product.creatorId?.name || 'Creator',
    });
  } catch (error) {
    console.error('createRazorpayOrder error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// Verifies the Razorpay payment signature.
// On success: deducts stock, creates Order record with status = 'paid'.
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      productId,
      quantity = 1,
    } = req.body;

    // ── 1. Verify HMAC-SHA256 signature ──────────────────────────────────────
    const body      = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed: invalid signature' });
    }

    // ── 2. Fetch product & validate stock ────────────────────────────────────
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock (race condition detected)' });
    }

    // ── 3. Deduct stock ───────────────────────────────────────────────────────
    product.stock -= quantity;
    await product.save();

    // ── 4. Create Order in DB ─────────────────────────────────────────────────
    const order = await Order.create({
      buyerId:    req.user._id,
      creatorId:  product.creatorId,
      items: [{
        itemModel: 'Product',
        itemId:    product._id,
        quantity,
        price:     product.price,
      }],
      totalAmount:       product.price * quantity,
      status:            'paid',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod:     'razorpay',
    });

    // ── 5. Notify buyer ───────────────────────────────────────────────────────
    await Notification.create({
      userId:  req.user._id,
      type:    'order_confirmed',
      title:   `Order confirmed: "${product.title}"`,
      message: `Your payment of ₹${product.price * quantity} was successful. Payment ID: ${razorpayPaymentId}`,
      link:    '/dashboard/user',
    });

    res.json({
      success: true,
      order,
      message: 'Payment verified and order placed successfully',
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: error.message });
  }
};
