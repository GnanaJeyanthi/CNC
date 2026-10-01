import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  type: {
    type: String,
    enum: [
      'NEW_ORDER',
      'ORDER_CONFIRMED',
      'ORDER_PREPARING',
      'ORDER_SHIPPED',
      'ORDER_OUT_FOR_DELIVERY',
      'ORDER_DELIVERED',
      'ORDER_RECEIVED_CONFIRMED',
      'workshop_reminder',   // 24hr before a workshop
      'workshop_live',       // workshop just went live
      'replay_published',    // a replay you attended is now available
      'certificate_ready',   // your certificate is ready
      'order_confirmed',     // legacy purchase confirmed
      'waitlist_promoted',   // you moved off waitlist into the workshop
      'gift_received',       // someone gifted you a workshop
      'review_reminder',     // remind to review after attending
      'new_enrollment',      // a new student enrolled
    ],
    required: true,
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  link:    { type: String, default: '' },   // frontend route to navigate to
  read:    { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
