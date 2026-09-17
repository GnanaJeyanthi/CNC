import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { processChatbotMessage, getQuickActions, resolveUserRole } from '../services/chatbotService.js';

// Helper to optionally extract authenticated user from bearer token
const extractUserFromRequest = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      return user;
    } catch (err) {
      // Invalid/expired token
      return null;
    }
  }
  return null;
};

// @desc    Process a message sent to CastNCart Assistant
// @route   POST /api/chatbot/message
// @access  Public (Guest) or Authenticated (Customer / Creator)
export const handleChatMessage = async (req, res) => {
  try {
    const { message, cart } = req.body;
    const user = await extractUserFromRequest(req);

    const result = await processChatbotMessage({
      message,
      user,
      cart: Array.isArray(cart) ? cart : []
    });

    res.json({
      success: true,
      role: resolveUserRole(user),
      ...result
    });
  } catch (error) {
    console.error('Chatbot Controller Error:', error);
    res.status(500).json({
      success: false,
      text: "Sorry, I couldn't retrieve that information right now. Please try again.",
      type: 'error'
    });
  }
};

// @desc    Get quick action suggestions based on authenticated role
// @route   GET /api/chatbot/quick-actions
// @access  Public / Authenticated
export const handleQuickActions = async (req, res) => {
  try {
    const user = await extractUserFromRequest(req);
    const actions = getQuickActions(user);
    res.json({
      success: true,
      role: resolveUserRole(user),
      actions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
