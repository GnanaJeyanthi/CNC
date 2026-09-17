import mongoose from 'mongoose';
import Workshop from '../models/Workshop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Participant from '../models/Participant.js';

// ── Helper: generate last N months labels ────────────────────────────────────
function lastNMonths(n) {
  const months = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' })
    });
  }
  return months;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CREATOR ANALYTICS  (rich version)
// ─────────────────────────────────────────────────────────────────────────────
export const getCreatorAnalytics = async (req, res) => {
  try {
    const creatorId = new mongoose.Types.ObjectId(req.params.id);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    // ── KPI counts ─────────────────────────────────────────────────────────
    const workshopIds = await Workshop.find({ creatorId }).distinct('_id');

    const [
      totalWorkshops,
      liveWorkshops,
      endedWorkshops,
      totalProducts,
      totalOrders,
      totalParticipants,
      attendedCount,
      totalRevenueAgg,
    ] = await Promise.all([
      Workshop.countDocuments({ creatorId }),
      Workshop.countDocuments({ creatorId, status: 'live' }),
      Workshop.countDocuments({ creatorId, status: 'ended' }),
      Product.countDocuments({ creatorId }),
      Order.countDocuments({ creatorId }),
      Participant.countDocuments({ workshopId: { $in: workshopIds } }),
      Participant.countDocuments({ workshopId: { $in: workshopIds }, attended: true }),
      Order.aggregate([
        { $match: { creatorId, status: { $in: ['paid', 'shipped', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const attendanceRate = totalParticipants > 0
      ? Math.round((attendedCount / totalParticipants) * 100) : 0;

    // ── Monthly revenue – last 6 months ────────────────────────────────────
    const revenueRaw = await Order.aggregate([
      { $match: { creatorId, status: { $in: ['paid', 'shipped', 'completed'] }, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months6 = lastNMonths(6);
    const monthlyRevenue = months6.map(m => {
      const found = revenueRaw.find(r => r._id.year === m.year && r._id.month === m.month);
      return { label: m.label, revenue: found?.revenue || 0, orders: found?.orders || 0 };
    });

    // ── Monthly enrollments – last 6 months ────────────────────────────────
    const enrollRaw = await Participant.aggregate([
      { $match: { workshopId: { $in: workshopIds }, joinedAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$joinedAt' }, month: { $month: '$joinedAt' } },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlyEnrollments = months6.map(m => {
      const found = enrollRaw.find(r => r._id.year === m.year && r._id.month === m.month);
      return { label: m.label, count: found?.count || 0 };
    });

    // ── Most popular workshops (by participant count) ───────────────────────
    const popularWorkshops = await Participant.aggregate([
      { $match: { workshopId: { $in: workshopIds } } },
      { $group: { _id: '$workshopId', enrollments: { $sum: 1 }, attended: { $sum: { $cond: ['$attended', 1, 0] } } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'workshops', localField: '_id', foreignField: '_id', as: 'w' } },
      { $unwind: '$w' },
      { $project: { _id: 0, title: '$w.title', enrollments: 1, attended: 1, price: '$w.price' } },
    ]);

    // ── Best-selling products ───────────────────────────────────────────────
    const bestProducts = await Order.aggregate([
      { $match: { creatorId, status: { $in: ['paid', 'shipped', 'completed'] } } },
      { $unwind: '$items' },
      { $match: { 'items.itemModel': 'Product' } },
      { $group: {
          _id: '$items.itemId',
          unitsSold: { $sum: '$items.quantity' },
          revenue:   { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      }},
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'p' } },
      { $unwind: { path: '$p', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, title: '$p.title', unitsSold: 1, revenue: 1 } },
    ]);

    // ── Workshop status breakdown (pie) ────────────────────────────────────
    const statusBreakdown = await Workshop.aggregate([
      { $match: { creatorId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // ── Legacy chart fields (keep existing dashboard working) ──────────────
    const chartLabels = monthlyRevenue.map(m => m.label);
    const chartData   = monthlyRevenue.map(m => m.revenue);

    res.json({
      // KPIs
      totalWorkshops, liveWorkshops, endedWorkshops,
      totalProducts, totalOrders, totalParticipants,
      attendedCount, attendanceRate, totalRevenue,
      // Charts
      monthlyRevenue,
      monthlyEnrollments,
      popularWorkshops,
      bestProducts,
      statusBreakdown,
      // Legacy
      chartLabels, chartData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  USER ANALYTICS  (rich version)
// ─────────────────────────────────────────────────────────────────────────────
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    // ── All participant records ─────────────────────────────────────────────
    const allParticipants = await Participant.find({ userId })
      .populate({ 
        path: 'workshopId', 
        select: 'title category price durationMinutes status scheduledDate recordingUrl thumbnailUrl replayPublished description',
        populate: { path: 'creatorId', select: 'name avatar' }
      });

    const validParticipants = allParticipants.filter(p => p.workshopId);
    const totalJoined   = validParticipants.length;
    const totalAttended = validParticipants.filter(p => p.attended).length;
    const attendancePct = totalJoined > 0 ? Math.round((totalAttended / totalJoined) * 100) : 0;
    const totalLearningMins = validParticipants.reduce((sum, p) => sum + (p.totalDurationMinutes || 0), 0);

    // ── All orders ─────────────────────────────────────────────────────────
    const allOrders = await Order.find({ buyerId: userId }).populate('items.itemId');
    const totalSpent    = allOrders.reduce((s, o) => s + o.totalAmount, 0);
    const productOrders = allOrders.filter(o => o.items.some(i => i.itemModel === 'Product'));
    const workshopOrders = allOrders.filter(o => o.items.some(i => i.itemModel === 'Workshop'));

    // ── Monthly workshops joined ────────────────────────────────────────────
    const joinRaw = await Participant.aggregate([
      { $match: { userId, joinedAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$joinedAt' }, month: { $month: '$joinedAt' } },
          count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months6 = lastNMonths(6);
    const monthlyJoined = months6.map(m => {
      const found = joinRaw.find(r => r._id.year === m.year && r._id.month === m.month);
      return { label: m.label, count: found?.count || 0 };
    });

    // ── Monthly spending ────────────────────────────────────────────────────
    const spendRaw = await Order.aggregate([
      { $match: { buyerId: userId, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          spent: { $sum: '$totalAmount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthlySpending = months6.map(m => {
      const found = spendRaw.find(r => r._id.year === m.year && r._id.month === m.month);
      return { label: m.label, spent: found?.spent || 0 };
    });

    // ── Category breakdown ─────────────────────────────────────────────────
    const categoryMap = {};
    validParticipants.forEach(p => {
      const cat = p.workshopId?.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([cat, count]) => ({ category: cat, count }))
      .sort((a, b) => b.count - a.count);

    // ── Attendance status breakdown ─────────────────────────────────────────
    const attendanceBreakdown = [
      { status: 'Attended',   count: validParticipants.filter(p => p.status === 'attended').length },
      { status: 'Partial',    count: validParticipants.filter(p => p.status === 'partial').length },
      { status: 'Absent',     count: validParticipants.filter(p => p.status === 'absent').length },
      { status: 'Registered', count: validParticipants.filter(p => p.status === 'registered').length },
    ];

    // ── Dashboard data (keep existing working) ─────────────────────────────
    const joinedWorkshops = validParticipants.map(p => ({
      ...p.workshopId.toObject(), attended: p.attended, status: p.status
    }));
    const upcomingWorkshops  = joinedWorkshops.filter(w => w.scheduledDate && new Date(w.scheduledDate) > new Date());
    const recordedVideos = joinedWorkshops.filter(w => w.recordingUrl || w.replayPublished);

    res.json({
      // KPIs
      totalJoined, totalAttended, attendancePct,
      totalSpent, totalLearningMins,
      productsPurchased: productOrders.length,
      workshopsPurchased: workshopOrders.length,
      // Charts
      monthlyJoined,
      monthlySpending,
      categoryBreakdown,
      attendanceBreakdown,
      // Dashboard data
      purchasedProducts: allOrders,
      upcomingWorkshops, recentlyWatched, recordedVideos, recommendedWorkshops,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Keep old name as alias for the user route
export const getUserDashboardData = getUserAnalytics;
