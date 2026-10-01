import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    itemModel: { type: String, required: true, enum: ['Product', 'Workshop', 'Replay'] },
    itemId: { type: mongoose.Schema.Types.ObjectId, refPath: 'items.itemModel', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Paid',
  },
  orderStatus: {
    type: String,
    enum: [
      'Order Confirmed',
      'Preparing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Customer Confirmed Received',
      'Cancelled',
    ],
    default: 'Order Confirmed',
  },
  // Legacy status for backwards compatibility
  status: { type: String, default: 'Order Confirmed' },
  customerReceived: { type: Boolean, default: false },
  customerReceivedAt: { type: Date, default: null },
  // Razorpay payment details
  razorpayOrderId:   { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  paymentMethod:     { type: String, default: 'razorpay' },
}, { timestamps: true });

orderSchema.index({ creatorId: 1 });
orderSchema.index({ buyerId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ razorpayOrderId: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
