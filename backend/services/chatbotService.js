import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Workshop from '../models/Workshop.js';
import Order from '../models/Order.js';
import Participant from '../models/Participant.js';
import GameStreak from '../models/GameStreak.js';
import GameScore from '../models/GameScore.js';
import User from '../models/User.js';

// Category-specific attribute field configurations for CastNCart Creator Products
export const CATEGORY_FIELDS_MAP = {
  'Home Bakery': [
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 250g, 500g, 1kg', required: true },
    { key: 'flavour', label: 'Flavour', placeholder: 'e.g. Chocolate, Vanilla Bean, Red Velvet', required: true },
    { key: 'ingredients', label: 'Ingredients', placeholder: 'e.g. Flour, Cocoa, Milk, Butter, Sugar', required: true },
    { key: 'prepTime', label: 'Preparation Time', placeholder: 'e.g. 4 hours, Baked fresh on order', required: false },
    { key: 'shelfLife', label: 'Shelf Life', placeholder: 'e.g. 3 days room temp, 7 days refrigerated', required: true }
  ],
  'Baking': [
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 250g, 500g, 1kg', required: true },
    { key: 'flavour', label: 'Flavour', placeholder: 'e.g. Chocolate, Vanilla Bean, Red Velvet', required: true },
    { key: 'ingredients', label: 'Ingredients', placeholder: 'e.g. Flour, Cocoa, Milk, Butter, Sugar', required: true },
    { key: 'prepTime', label: 'Preparation Time', placeholder: 'e.g. 4 hours, Baked fresh on order', required: false },
    { key: 'shelfLife', label: 'Shelf Life', placeholder: 'e.g. 3 days room temp, 7 days refrigerated', required: true }
  ],
  'Crochet & Knitting': [
    { key: 'yarnMaterial', label: 'Yarn Material', placeholder: 'e.g. 100% Cotton, Soft Acrylic, Wool Blend', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Pastel Pink, Beige, Multi-tone', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Free Size, S/M/L, 12x12 inches', required: true },
    { key: 'handmadeTime', label: 'Handmade Time', placeholder: 'e.g. 12 Hours, 2 Days of craftsmanship', required: false }
  ],
  'Crochet': [
    { key: 'yarnMaterial', label: 'Yarn Material', placeholder: 'e.g. 100% Cotton, Soft Acrylic, Wool Blend', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Pastel Pink, Beige, Multi-tone', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Free Size, S/M/L, 12x12 inches', required: true },
    { key: 'handmadeTime', label: 'Handmade Time', placeholder: 'e.g. 12 Hours, 2 Days of craftsmanship', required: false }
  ],
  'Knitting': [
    { key: 'yarnMaterial', label: 'Yarn Material', placeholder: 'e.g. Merino Wool, Cashmere Blend, Soft Acrylic', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Mustard Yellow, Cream White', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. S, M, L, XL', required: true },
    { key: 'handmadeTime', label: 'Handmade Time', placeholder: 'e.g. 3 Days', required: false }
  ],
  'Handmade Candles': [
    { key: 'waxType', label: 'Wax Type', placeholder: 'e.g. 100% Soy Wax, Organic Beeswax, Gel Wax', required: true },
    { key: 'fragrance', label: 'Fragrance', placeholder: 'e.g. French Lavender, Vanilla Caramel, Unscented', required: true },
    { key: 'burnTime', label: 'Burn Time', placeholder: 'e.g. 35-40 Hours', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 200g, 350g candle jar', required: true }
  ],
  'Candle Making': [
    { key: 'waxType', label: 'Wax Type', placeholder: 'e.g. 100% Soy Wax, Organic Beeswax, Gel Wax', required: true },
    { key: 'fragrance', label: 'Fragrance', placeholder: 'e.g. French Lavender, Vanilla Caramel, Unscented', required: true },
    { key: 'burnTime', label: 'Burn Time', placeholder: 'e.g. 35-40 Hours', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 200g, 350g candle jar', required: true }
  ],
  'Handmade Jewellery': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Resin, Polymer Clay, 925 Silver Plated, Brass', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Emerald Green, Rose Gold', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Adjustable, 2.4 Bangle, 18-inch chain', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 15g, Light-weight', required: false }
  ],
  'Jewellery': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Resin, Polymer Clay, 925 Silver Plated, Brass', required: true },
    { key: 'color', label: 'Color', placeholder: 'e.g. Emerald Green, Rose Gold', required: true },
    { key: 'size', label: 'Size', placeholder: 'e.g. Adjustable, 2.4 Bangle, 18-inch chain', required: true },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 15g, Light-weight', required: false }
  ],
  'Resin Art': [
    { key: 'material', label: 'Material', placeholder: 'e.g. Epoxy Resin & Teak Wood, Real Dried Flowers', required: true },
    { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 12x12 inches, 6 inch diameter', required: true },
    { key: 'finish', label: 'Finish', placeholder: 'e.g. High Gloss Mirror Finish, Satin Matte', required: true }
  ],
  'Pottery': [
    { key: 'clayType', label: 'Clay Type', placeholder: 'e.g. Terracotta, Stoneware, Porcelain', required: true },
    { key: 'size', label: 'Size / Capacity', placeholder: 'e.g. 350ml Coffee Mug, 8 inch Bowl', required: true },
    { key: 'finish', label: 'Finish', placeholder: 'e.g. Food-Safe Gloss Glaze, Raw Terracotta', required: true }
  ]
};

// Map raw database role to system role: only CUSTOMER or CREATOR
export function resolveUserRole(user) {
  if (!user) return 'GUEST';
  if (user.role === 'Creator') return 'CREATOR';
  return 'CUSTOMER';
}

// Helper to get today's date in YYYY-MM-DD
function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

function getPuzzleNumberForGame(gameId, dateStr) {
  const baseDate = new Date('2025-01-01');
  const targetDate = new Date(dateStr || getTodayDateStr());
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const offsets = { zip: 534, queens: 855, tango: 695 };
  return (offsets[gameId] || 100) + Math.max(0, diffDays);
}

// Quick action suggestions based on role
export function getQuickActions(user) {
  const role = resolveUserRole(user);
  if (role === 'CREATOR') {
    return [
      { label: 'My Workshops', query: 'Show my workshops' },
      { label: 'Create Workshop', query: 'How do I create a workshop?' },
      { label: 'My Products', query: 'Show my products' },
      { label: 'Sell Product', query: 'How do I add a product?' },
      { label: 'Attendance', query: 'Show attendance for my workshops' },
      { label: 'My Revenue', query: 'Show my revenue' }
    ];
  }
  if (role === 'CUSTOMER') {
    return [
      { label: 'Find Products', query: 'Show available products' },
      { label: 'Find Workshops', query: 'What workshops are available?' },
      { label: 'My Orders', query: 'Show my orders' },
      { label: 'My Cart', query: "What's in my cart?" },
      { label: 'My Enrollments', query: 'Show my enrolled workshops' },
      { label: 'Daily Puzzle', query: "What is today's puzzle?" }
    ];
  }
  // GUEST
  return [
    { label: 'Find Products', query: 'Show available products' },
    { label: 'Find Workshops', query: 'What workshops are available?' },
    { label: 'Daily Puzzle', query: "What is today's puzzle?" },
    { label: 'Sign In', query: 'Open sign in' }
  ];
}

/**
 * Core Chatbot Service message handler
 */
export async function processChatbotMessage({ message, user, cart = [] }) {
  try {
    const rawText = (message || '').trim();
    if (!rawText) {
      return {
        text: "Hello! I'm CastNCart Assistant. How can I help you today?",
        cards: [],
        type: 'text'
      };
    }

    const lower = rawText.toLowerCase();
    const role = resolveUserRole(user);

    // ── 1. GREETINGS & IDENTITY ──────────────────────────────────────────────
    if (/^(hi|hello|hey|greetings|hola|good\s(morning|afternoon|evening))\b/i.test(lower)) {
      const name = user?.name ? ` ${user.name}` : '';
      if (role === 'CREATOR') {
        return {
          text: `Hello${name}! I'm CastNCart Assistant. I can help manage your workshops, monitor student attendance, check product sales, or guide you through live streaming.`,
          type: 'text',
          cards: []
        };
      } else if (role === 'CUSTOMER') {
        return {
          text: `Hello${name}! I'm CastNCart Assistant. I can help you find handmade crafts, discover live workshops, track your orders, manage your cart, and check daily puzzles.`,
          type: 'text',
          cards: []
        };
      }
      return {
        text: "Hello! I'm CastNCart Assistant. I can help you discover unique handmade products, live interactive workshops, and daily puzzles on CastNCart.",
        type: 'text',
        cards: []
      };
    }

    // ── 2. NAVIGATION COMMANDS ────────────────────────────────────────────────
    if (lower.includes('open marketplace') || lower === 'marketplace') {
      return {
        text: "Opening the CastNCart Marketplace for you.",
        type: 'navigation',
        navigation: { path: '/marketplace', label: 'Go to Marketplace' }
      };
    }
    if (lower.includes('open workshops') || lower === 'workshops' || lower.includes('open live workshops')) {
      return {
        text: "Taking you to Live Workshops.",
        type: 'navigation',
        navigation: { path: '/workshops', label: 'Go to Workshops' }
      };
    }
    if (lower.includes('open today\'s puzzle') || lower.includes('open puzzle') || lower.includes('daily games') || lower === 'puzzles') {
      return {
        text: "Opening Today's Daily Logic Puzzles!",
        type: 'navigation',
        navigation: { path: '/games', label: 'Play Daily Puzzles' }
      };
    }
    if (lower.includes('open categories') || lower === 'categories') {
      return {
        text: "Taking you to Categories Explore.",
        type: 'navigation',
        navigation: { path: '/categories', label: 'Explore Categories' }
      };
    }
    if (lower.includes('open sign in') || lower.includes('go to login') || lower.includes('sign in')) {
      return {
        text: "You can sign in to your CastNCart account here:",
        type: 'navigation',
        navigation: { path: '/signin', label: 'Sign In' }
      };
    }

    // ── 3. ROLE SECURITY GUARDS ──────────────────────────────────────────────
    // A CUSTOMER must NEVER access Creator features
    const isCreatorOnlyQuery = 
      /show (my|creator) (revenue|earnings|sales analytics)|attendance for my workshops|who attended my workshop|create a workshop|start a live class|upload a (replay|recording)|publish a recorded session|products are low in stock/i.test(lower);

    if (isCreatorOnlyQuery && role === 'CUSTOMER') {
      return {
        text: "Creator tools, workshops management, attendance reports, and revenue analytics are only accessible to verified Creators. You are currently logged in as a Customer.",
        type: 'text',
        cards: []
      };
    }

    // A GUEST attempting private actions
    if (role === 'GUEST' && (lower.includes('my order') || lower.includes('my cart') || lower.includes('my streak') || lower.includes('my workshop') || lower.includes('my revenue') || lower.includes('my attendance'))) {
      return {
        text: "Please sign in to view your personal information, orders, cart, or creator dashboard.",
        type: 'navigation',
        navigation: { path: '/signin', label: 'Sign In to CastNCart' }
      };
    }

    // ── 4. CREATOR: ATTENDANCE (Highest priority for attendance keywords) ────
    if (
      role === 'CREATOR' &&
      (lower.includes('attendance') ||
       lower.includes('who attended') ||
       lower.includes('students attended') ||
       lower.includes('attendance percentage') ||
       lower.includes('attendance rate'))
    ) {
      return await handleCreatorAttendance(user);
    }

    // ── 5. CREATOR: REVENUE & ANALYTICS ─────────────────────────────────────
    if (
      role === 'CREATOR' &&
      (lower.includes('revenue') ||
       lower.includes('earnings') ||
       lower.includes('how much have i made') ||
       lower.includes('my performance') ||
       lower.includes('selling the most') ||
       lower.includes('sales analytics') ||
       lower.includes('analytics'))
    ) {
      return await handleCreatorAnalytics(user);
    }

    // ── 6. CREATOR: CATEGORY FIELDS EXPLANATION ──────────────────────────────
    if (
      lower.includes('field') ||
      lower.includes('attribute') ||
      lower.includes('ingredients') ||
      lower.includes('shelf life') ||
      lower.includes('burn time') ||
      lower.includes('yarn material')
    ) {
      const categoryResult = handleCategoryFieldsQuery(lower);
      if (categoryResult) return categoryResult;
    }

    // ── 7. CREATOR: WORKSHOP MANAGEMENT & LIVE CLASS ─────────────────────────
    if (
      role === 'CREATOR' &&
      (lower.includes('my workshop') ||
       lower.includes('create a workshop') ||
       lower.includes('schedule a workshop') ||
       lower.includes('how many people enrolled') ||
       lower.includes('when is my next workshop') ||
       lower.includes('start a live') ||
       lower.includes('go live') ||
       lower.includes('end a live') ||
       lower.includes('class over') ||
       lower.includes('camera') ||
       lower.includes('microphone') ||
       lower.includes('screen share') ||
       lower.includes('upload a recording') ||
       lower.includes('recording') ||
       lower.includes('replay'))
    ) {
      return await handleCreatorWorkshops(lower, user);
    }

    // ── 8. CREATOR: PRODUCT MANAGEMENT ───────────────────────────────────────
    if (
      role === 'CREATOR' &&
      (lower.includes('my product') ||
       lower.includes('how do i add a product') ||
       lower.includes('how to sell a product') ||
       lower.includes('low in stock') ||
       lower.includes('how many products have i sold') ||
       lower.includes('edit a product') ||
       lower.includes('sell product'))
    ) {
      return await handleCreatorProducts(lower, user);
    }

    // ── 9. CUSTOMER: ORDERS ──────────────────────────────────────────────────
    if (
      lower.includes('my order') ||
      lower.includes('where is my order') ||
      lower.includes('what did i purchase') ||
      lower.includes('order history') ||
      lower.includes('purchase history')
    ) {
      if (role !== 'CUSTOMER') {
        return {
          text: "Order history is available for customer accounts. Please log in as a Customer to view your orders.",
          type: 'text'
        };
      }
      return await handleCustomerOrders(user);
    }

    // ── 10. CUSTOMER: CART ───────────────────────────────────────────────────
    if (
      lower.includes('cart') ||
      lower.includes('what\'s in my cart') ||
      lower.includes('how much is my cart') ||
      lower.includes('remove') && lower.includes('cart') ||
      lower.includes('add') && lower.includes('cart')
    ) {
      return await handleCartQuery(lower, cart);
    }

    // ── 11. CUSTOMER: ENROLLMENTS & JOINING LIVE WORKSHOP ────────────────────
    if (
      lower.includes('my enrollment') ||
      lower.includes('enrolled workshop') ||
      lower.includes('how to enroll') ||
      lower.includes('how to join') ||
      lower.includes('join live')
    ) {
      return await handleCustomerEnrollments(lower, user);
    }

    // ── 12. CUSTOMER / PUBLIC: DAILY PUZZLES ─────────────────────────────────
    if (
      lower.includes('puzzle') ||
      lower.includes('queens') ||
      lower.includes('tango') ||
      lower.includes('streak') ||
      lower.includes('leaderboard') ||
      lower.includes('hint')
    ) {
      return await handleDailyPuzzlesQuery(lower, user);
    }

    // ── 13. CUSTOMER / PUBLIC: WORKSHOPS SEARCH ──────────────────────────────
    const isWorkshopQuery = /\b(workshop|workshops|class|classes|webinar|webinars|session|sessions|course|courses)\b/i.test(lower);
    if (isWorkshopQuery) {
      return await handleWorkshopSearch(lower, user);
    }

    // ── 14. CUSTOMER / PUBLIC: PRODUCTS SEARCH ───────────────────────────────
    const isProductQuery = /\b(product|products|item|items|craft|crafts|handmade|buy|shop|shopping|marketplace|store|merchandise|painting|crochet|baking|candle|soap|brush|makeup|kit|jewellery|pottery|resin|price|rate|cost|how much)\b/i.test(lower);
    if (isProductQuery) {
      return await handleProductSearch(lower);
    }

    // ── 15. OPTIONAL LLM AUGMENTATION OR FALLBACK ────────────────────────────
    if (process.env.GEMINI_API_KEY) {
      const llmResult = await callGeminiLLM(rawText, user, role);
      if (llmResult) return llmResult;
    }

    // ── 16. UNRELATED / OUT-OF-SCOPE QUESTIONS ──────────────────────────────
    return {
      text: "I'm CastNCart Assistant. I can help you with workshops, products, orders, attendance, creators and puzzles.",
      type: 'text',
      cards: []
    };

  } catch (err) {
    console.error('Chatbot service error:', err);
    return {
      text: "Sorry, I couldn't retrieve that information right now. Please try again.",
      type: 'error',
      cards: []
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Category Fields Query
// ─────────────────────────────────────────────────────────────────────────────
function handleCategoryFieldsQuery(query) {
  for (const [catName, fields] of Object.entries(CATEGORY_FIELDS_MAP)) {
    if (query.includes(catName.toLowerCase())) {
      const fieldList = fields.map(f => `• **${f.label}** (${f.required ? 'Required' : 'Optional'}): ${f.placeholder}`).join('\n');
      return {
        text: `Here are the category-specific attributes for **${catName}** on CastNCart:\n\n${fieldList}\n\nThese fields are automatically rendered in the product upload form when you select "${catName}".`,
        type: 'text'
      };
    }
  }

  return {
    text: "CastNCart supports category-specific product fields such as:\n\n• **Baking**: Weight, Flavour, Ingredients, Preparation Time, Shelf Life\n• **Crochet & Knitting**: Yarn Material, Color, Size, Handmade Time\n• **Candle Making**: Wax Type, Fragrance, Burn Time, Weight\n• **Jewellery**: Material, Color, Size, Weight\n• **Pottery**: Clay Type, Size/Capacity, Finish\n• **Resin Art**: Material, Dimensions, Finish\n\nAsk me about any specific category for the full list of fields!",
    type: 'text'
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Product Search (Real DB Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleProductSearch(query) {
  const clean = query
    .replace(/\b(show me|show|find|search|get|browse|display|list|products|product|items|item|handmade|available|can you|give me|give|me|what|are|is|the|all|in|on|of|for|a|an|some|any|do you have|i want|i need|please|tell|about|price|rate|cost|how much)\b/gi, '')
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let filter = {};

  if (clean.length > 1) {
    const regex = new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter = {
      $or: [
        { title: regex },
        { description: regex },
        { category: regex }
      ]
    };
  }

  // Price checks (e.g. "under 100", "under 500")
  const priceUnderMatch = query.match(/under\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (priceUnderMatch) {
    const maxPrice = Number(priceUnderMatch[1]);
    filter.price = { ...(filter.price || {}), $lte: maxPrice };
  }

  const products = await Product.find(filter)
    .populate('creatorId', 'name')
    .sort({ createdAt: -1 })
    .limit(6);

  if (!products || products.length === 0) {
    return {
      text: "I couldn't find any matching information in CastNCart.",
      type: 'products',
      cards: []
    };
  }

  const productCards = products.map(p => ({
    id: p._id,
    title: p.title,
    category: p.category,
    price: p.price,
    stock: p.stock,
    imageUrl: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=60',
    creatorName: p.creatorId?.name || 'CastNCart Creator',
    viewUrl: `/marketplace/${p._id}`
  }));

  const countText = products.length === 1 ? '1 product' : `${products.length} products`;
  return {
    text: `I found ${countText} for you:`,
    type: 'products',
    cards: productCards
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Workshop Search (Real DB Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleWorkshopSearch(query, user) {
  const clean = query
    .replace(/\b(show me|show|find|search|get|browse|display|list|workshops|workshop|classes|class|available|what|are|is|the|all|in|on|of|for|a|an|some|any|can you|give me|give|me|do you have|i want|i need|please|tell|about|upcoming|live|scheduled)\b/gi, '')
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let filter = {};
  if (clean.length > 1) {
    const regex = new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter = {
      $or: [
        { title: regex },
        { description: regex },
        { category: regex }
      ]
    };
  }

  const workshops = await Workshop.find(filter)
    .populate('creatorId', 'name profilePhoto')
    .sort({ scheduledDate: 1 })
    .limit(6);

  if (!workshops || workshops.length === 0) {
    return {
      text: "I couldn't find any matching information in CastNCart.",
      type: 'workshops',
      cards: []
    };
  }

  // Calculate remaining seats for each workshop using Participant model
  const workshopCards = await Promise.all(workshops.map(async (w) => {
    const participantCount = await Participant.countDocuments({ workshopId: w._id });
    const availableSeats = Math.max(0, (w.maxParticipants || 50) - participantCount);

    let isEnrolled = false;
    if (user && user._id) {
      const existing = await Participant.findOne({ workshopId: w._id, userId: user._id });
      isEnrolled = !!existing;
    }

    return {
      id: w._id,
      title: w.title,
      category: w.category,
      price: w.price === 0 ? 'Free' : `₹${w.price}`,
      creatorName: w.creatorId?.name || 'Creator',
      scheduledDate: w.scheduledDate ? new Date(w.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible',
      scheduledTime: w.scheduledDate ? new Date(w.scheduledDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'TBA',
      durationMinutes: w.durationMinutes || 60,
      status: w.status,
      availableSeats,
      isEnrolled,
      thumbnailUrl: w.thumbnailUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
      viewUrl: `/workshops/${w._id}`
    };
  }));

  const countText = workshops.length === 1 ? '1 workshop' : `${workshops.length} workshops`;
  return {
    text: `I found ${countText} for you:`,
    type: 'workshops',
    cards: workshopCards
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Customer Orders (Role Security & Real Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCustomerOrders(user) {
  if (!user || !user._id) {
    return {
      text: "Please sign in to view your orders.",
      type: 'navigation',
      navigation: { path: '/signin', label: 'Sign In' }
    };
  }

  const orders = await Order.find({ buyerId: user._id })
    .populate('items.itemId')
    .sort({ createdAt: -1 })
    .limit(5);

  if (!orders || orders.length === 0) {
    return {
      text: "You don't have any orders yet. Would you like to explore our marketplace or live workshops?",
      type: 'navigation',
      navigation: { path: '/marketplace', label: 'Explore Marketplace' }
    };
  }

  const orderCards = orders.map(o => {
    const itemSummaries = (o.items || []).map(i => {
      const title = i.itemId?.title || `${i.itemModel} Item`;
      return `${title} (x${i.quantity})`;
    });

    return {
      id: o._id.toString(),
      shortId: o._id.toString().slice(-6).toUpperCase(),
      items: itemSummaries.join(', '),
      totalAmount: `₹${o.totalAmount}`,
      status: o.status,
      paymentStatus: o.status === 'paid' ? 'Paid' : o.status,
      orderDate: new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    };
  });

  return {
    text: `Here is your recent order history (${orders.length} orders):`,
    type: 'orders',
    cards: orderCards
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Cart (Customer / Shared State)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCartQuery(query, cart = []) {
  if (!cart || cart.length === 0) {
    return {
      text: "Your cart is currently empty. You can browse our marketplace and add handmade products!",
      type: 'cart',
      cartItems: [],
      cartTotal: 0,
      navigation: { path: '/marketplace', label: 'Browse Products' }
    };
  }

  const total = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const itemsText = cart.map(i => `• ${i.title} (x${i.quantity || 1}) - ₹${(i.price || 0) * (i.quantity || 1)}`).join('\n');

  if (query.includes('how much') || query.includes('total')) {
    return {
      text: `Your cart total is ₹${total} for ${cart.length} item(s).\n\n${itemsText}`,
      type: 'cart',
      cartItems: cart,
      cartTotal: total
    };
  }

  return {
    text: `You have ${cart.length} item(s) in your cart (Total: ₹${total}):\n\n${itemsText}`,
    type: 'cart',
    cartItems: cart,
    cartTotal: total
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Daily Puzzles (Queens & Tango)
// ─────────────────────────────────────────────────────────────────────────────
async function handleDailyPuzzlesQuery(query, user) {
  const today = getTodayDateStr();
  const queensNum = getPuzzleNumberForGame('queens', today);
  const tangoNum = getPuzzleNumberForGame('tango', today);

  // User streak
  if (query.includes('streak') || query.includes('my streak') || query.includes('score')) {
    if (!user || !user._id) {
      return {
        text: "Please sign in to check your personal puzzle streak and stats.",
        type: 'navigation',
        navigation: { path: '/signin', label: 'Sign In' }
      };
    }
    const streakRecord = await GameStreak.findOne({ user: user._id });
    const current = streakRecord?.currentStreak || 0;
    const max = streakRecord?.maxStreak || 0;
    const wins = streakRecord?.totalWins || 0;

    return {
      text: `🔥 Your current Daily Puzzle streak is ${current} day${current === 1 ? '' : 's'}! Your all-time best is ${max} day${max === 1 ? '' : 's'}, with ${wins} total solved puzzles.`,
      type: 'puzzle',
      streak: { current, max, wins }
    };
  }

  // Hints
  if (query.includes('hint') || query.includes('how to solve')) {
    return {
      text: "💡 **CastNCart Daily Logic Puzzle Hints**:\n\n• **Queens**: Each colored region, row, and column must contain exactly one crown. Crowns cannot touch each other, even diagonally! Start by marking 'X' in all cells adjacent to placed crowns.\n\n• **Tango**: Fill every cell with Sun ☀️ or Moon 🌙 so that no 3 identical symbols are adjacent horizontally or vertically, and each row and column has an equal number of Suns and Moons. If you see two identical symbols side-by-side (☀️☀️), the neighboring cells must be the opposite symbol (🌙)!\n\nGive it your best shot!",
      type: 'text'
    };
  }

  // Leaderboard
  if (query.includes('leaderboard') || query.includes('rank')) {
    return {
      text: "🏆 The CastNCart Daily Puzzle Leaderboard tracks completion speed for each game every day, as well as the longest consecutive play streaks across all players. Complete today's Queens or Tango to rank on today's leaderboard!",
      type: 'navigation',
      navigation: { path: '/games', label: 'View Leaderboard' }
    };
  }

  // Default puzzle status
  return {
    text: `Today's Daily Logic Puzzles are live!\n\n• 👑 **Queens #${queensNum}**: Place one crown in each colored zone, row, and column without touching.\n• ☀️🌙 **Tango #${tangoNum}**: Balance Suns and Moons without 3 in a row.\n\nPlay daily to build your streak and climb the leaderboard!`,
    type: 'navigation',
    navigation: { path: '/games', label: 'Play Today\'s Puzzles' }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Customer Workshop Enrollments
// ─────────────────────────────────────────────────────────────────────────────
async function handleCustomerEnrollments(query, user) {
  if (!user || !user._id) {
    return {
      text: "To view your enrolled workshops, please sign in.",
      type: 'navigation',
      navigation: { path: '/signin', label: 'Sign In' }
    };
  }

  const enrollments = await Participant.find({ userId: user._id })
    .populate({
      path: 'workshopId',
      select: 'title scheduledDate durationMinutes category status jitsiRoomName ngrokUrl'
    })
    .sort({ joinedAt: -1 });

  const valid = enrollments.filter(e => e.workshopId);

  if (valid.length === 0) {
    return {
      text: "You haven't enrolled in any workshops yet. Browse our live workshops to learn new skills!",
      type: 'navigation',
      navigation: { path: '/workshops', label: 'Explore Workshops' }
    };
  }

  const list = valid.map(e => {
    const w = e.workshopId;
    const dateStr = w.scheduledDate ? new Date(w.scheduledDate).toLocaleDateString() : 'TBA';
    const liveNote = w.status === 'live' ? ' [🔴 LIVE NOW]' : '';
    return `• ${w.title} (${dateStr})${liveNote}`;
  }).join('\n');

  return {
    text: `You are enrolled in ${valid.length} workshop(s):\n\n${list}\n\nYou can join live classes directly from your dashboard when the creator starts broadcasting!`,
    type: 'navigation',
    navigation: { path: '/dashboard/user', label: 'Go to My Dashboard' }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Creator Workshops (Role Security & Real Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCreatorWorkshops(query, user) {
  if (!user || !user._id) {
    return { text: "Please log in as a Creator to access workshop management.", type: 'text' };
  }

  // "How do I create a workshop?"
  if (query.includes('how do i create') || query.includes('create a workshop') || query.includes('schedule')) {
    return {
      text: "To create a workshop:\n1. Go to your **Creator Dashboard**.\n2. Click the **'Schedule Workshop'** button.\n3. Fill in your workshop title, category, date, duration, pricing (free or paid), and max seats.\n4. Upload a thumbnail image.\n5. Click **Publish** to schedule it for students!",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Open Creator Dashboard' }
    };
  }

  // Live class guidance: starting, ending, troubleshooting
  if (query.includes('start a live') || query.includes('go live') || query.includes('camera') || query.includes('microphone') || query.includes('troubleshoot')) {
    return {
      text: "🎥 **Live Workshop Guidelines for Creators**:\n\n• **Starting**: On your Creator Dashboard, find your scheduled workshop and click **'Go Live'**. This opens your dedicated Jitsi/ngrok video classroom.\n• **Camera & Mic**: Grant browser permissions when prompted. If not working, click the padlock icon in your browser URL bar to allow camera & microphone access.\n• **Screen Sharing**: Use the monitor icon on the bottom toolbar to share presentation slides or video references.\n• **Live Attendance**: Attendance is automatically tracked when enrolled students enter the room.\n• **Ending**: When finished, click **'Class Over'** to wrap up the session and record final attendance.",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Go to Creator Dashboard' }
    };
  }

  // Replay guidance
  if (query.includes('recording') || query.includes('replay')) {
    return {
      text: "📹 **Workshop Replays & Recordings**:\n\nAfter a workshop ends, you can upload the session video from your Creator Dashboard under the workshop's 'Manage' tab. You can set the replay to be free for enrolled attendees or set a replay price for students who missed the live session.",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Manage Workshops' }
    };
  }

  // "Show my workshops" / "How many people enrolled?" / "When is my next workshop?"
  const workshops = await Workshop.find({ creatorId: user._id }).sort({ scheduledDate: 1 });

  if (!workshops || workshops.length === 0) {
    return {
      text: "You haven't scheduled any workshops yet. Would you like to create one now?",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Create First Workshop' }
    };
  }

  const cards = await Promise.all(workshops.map(async (w) => {
    const participantCount = await Participant.countDocuments({ workshopId: w._id });
    const attendedCount = await Participant.countDocuments({ workshopId: w._id, attended: true });
    return {
      id: w._id,
      title: w.title,
      category: w.category,
      status: w.status,
      price: w.price === 0 ? 'Free' : `₹${w.price}`,
      scheduledDate: w.scheduledDate ? new Date(w.scheduledDate).toLocaleDateString() : 'TBA',
      participants: participantCount,
      attended: attendedCount,
      viewUrl: `/workshops/${w._id}`
    };
  }));

  const upcoming = workshops.find(w => w.scheduledDate && new Date(w.scheduledDate) > new Date());
  let intro = `You have ${workshops.length} workshop(s) in CastNCart.`;
  if (upcoming) {
    intro += ` Your next workshop is "${upcoming.title}" on ${new Date(upcoming.scheduledDate).toLocaleDateString()}.`;
  }

  return {
    text: intro,
    type: 'creator_workshops',
    cards
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Creator Attendance (Role Security & Real Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCreatorAttendance(user) {
  if (!user || !user._id) {
    return { text: "Please log in as a Creator to view attendance reports.", type: 'text' };
  }

  const workshops = await Workshop.find({ creatorId: user._id }).select('_id title scheduledDate status');

  if (!workshops || workshops.length === 0) {
    return {
      text: "You don't have any workshops yet to report attendance for.",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Create Workshop' }
    };
  }

  const rows = await Promise.all(workshops.map(async (w) => {
    const total = await Participant.countDocuments({ workshopId: w._id });
    const attended = await Participant.countDocuments({ workshopId: w._id, status: { $in: ['attended', 'partial'] } });
    const absent = await Participant.countDocuments({ workshopId: w._id, status: 'absent' });
    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      workshopId: w._id,
      title: w.title,
      status: w.status,
      total,
      attended,
      absent,
      rate: `${rate}%`
    };
  }));

  return {
    text: `Here is the student attendance overview for your workshops:`,
    type: 'attendance',
    attendanceRows: rows,
    navigation: { path: '/dashboard/attendance', label: 'View Detailed Attendance Dashboard' }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Creator Products & Category Fields (Real Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCreatorProducts(query, user) {
  if (!user || !user._id) {
    return { text: "Please log in as a Creator to manage your products.", type: 'text' };
  }

  // Check if creator asks for category field instructions
  for (const [catName, fields] of Object.entries(CATEGORY_FIELDS_MAP)) {
    if (query.includes(catName.toLowerCase())) {
      const fieldList = fields.map(f => `• **${f.label}** (${f.required ? 'Required' : 'Optional'}): ${f.placeholder}`).join('\n');
      return {
        text: `Here are the category-specific attributes for **${catName}** on CastNCart:\n\n${fieldList}\n\nThese fields are automatically rendered in the product upload form when you select "${catName}".`,
        type: 'text'
      };
    }
  }

  // How to add a product
  if (query.includes('how do i add') || query.includes('how to sell') || query.includes('add a product')) {
    return {
      text: "To add a new product:\n1. Open your **Creator Dashboard**.\n2. Click the **'Add Product'** button in the Marketplace section.\n3. Enter the product title, description, category, price, and initial stock.\n4. Fill in the category-specific fields (e.g., Weight/Flavour for Baking, Yarn/Size for Crochet, Wax/Fragrance for Candles).\n5. Upload product images and save.",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Go to Creator Dashboard' }
    };
  }

  const products = await Product.find({ creatorId: user._id }).sort({ createdAt: -1 });

  if (!products || products.length === 0) {
    return {
      text: "You haven't listed any products yet. You can list handmade items or craft kits directly on the marketplace!",
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Add Product' }
    };
  }

  // "Which products are low in stock?"
  if (query.includes('low in stock') || query.includes('stock')) {
    const lowStock = products.filter(p => p.stock < 5);
    if (lowStock.length === 0) {
      return {
        text: `All of your ${products.length} products have healthy inventory levels (5+ units in stock).`,
        type: 'text'
      };
    }
    const list = lowStock.map(p => `• **${p.title}** - only ${p.stock} left in stock (₹${p.price})`).join('\n');
    return {
      text: `⚠️ You have ${lowStock.length} product(s) with low stock:\n\n${list}\n\nConsider updating your stock on the dashboard.`,
      type: 'navigation',
      navigation: { path: '/dashboard/creator', label: 'Manage Products' }
    };
  }

  // Default: Show creator's products
  const productCards = products.map(p => ({
    id: p._id,
    title: p.title,
    category: p.category,
    price: p.price,
    stock: p.stock,
    imageUrl: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=60',
    viewUrl: `/marketplace/${p._id}`
  }));

  return {
    text: `You have ${products.length} listed product(s) on CastNCart:`,
    type: 'products',
    cards: productCards
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLER: Creator Revenue & Performance (Real Data)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCreatorAnalytics(user) {
  if (!user || !user._id) {
    return { text: "Please log in as a Creator to access your financial analytics.", type: 'text' };
  }

  const creatorId = new mongoose.Types.ObjectId(user._id);

  const [
    totalWorkshops,
    totalProducts,
    totalOrders,
    revenueAgg,
    bestProductAgg
  ] = await Promise.all([
    Workshop.countDocuments({ creatorId }),
    Product.countDocuments({ creatorId }),
    Order.countDocuments({ creatorId }),
    Order.aggregate([
      { $match: { creatorId, status: { $in: ['paid', 'shipped', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { creatorId, status: { $in: ['paid', 'shipped', 'completed'] } } },
      { $unwind: '$items' },
      { $match: { 'items.itemModel': 'Product' } },
      { $group: { _id: '$items.itemId', units: { $sum: '$items.quantity' }, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } }
    ])
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const bestProd = bestProductAgg[0]?.prod?.title || 'None yet';

  return {
    text: `📊 **Your Creator Performance Summary**:\n\n• **Total Revenue**: ₹${totalRevenue}\n• **Total Orders**: ${totalOrders}\n• **Active Workshops**: ${totalWorkshops}\n• **Listed Products**: ${totalProducts}\n• **Top Selling Item**: ${bestProd}`,
    type: 'navigation',
    navigation: { path: '/dashboard/analytics', label: 'View Full Creator Analytics' }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM Integration: Optional Gemini Call
// ─────────────────────────────────────────────────────────────────────────────
async function callGeminiLLM(userPrompt, user, role) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemInstruction = `You are CastNCart Assistant, a polite and helpful assistant for the CastNCart craft & workshop platform. The current user is a ${role}. Never make up fake products or workshops. Keep answers concise and helpful.`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\nUser Question: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.4
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return { text: text.trim(), type: 'text', cards: [] };
    }
    return null;
  } catch (e) {
    console.warn('Gemini LLM call failed or timed out:', e.message);
    return null;
  }
}
