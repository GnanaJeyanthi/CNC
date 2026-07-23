import Participant from '../models/Participant.js';
import Workshop from '../models/Workshop.js';

// ── User: Record joining a live session ──────────────────────────────────────
export const recordJoin = async (req, res) => {
  try {
    const participant = await Participant.findOne({
      workshopId: req.params.id,
      userId: req.user._id
    });
    if (!participant) return res.status(403).json({ message: 'Not enrolled in this workshop' });

    participant.joinTime = new Date();
    participant.status = 'attended';
    participant.attended = true;
    await participant.save();
    res.json({ message: 'Join time recorded', participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── User: Record leaving a live session ──────────────────────────────────────
export const recordLeave = async (req, res) => {
  try {
    const participant = await Participant.findOne({
      workshopId: req.params.id,
      userId: req.user._id
    });
    if (!participant) return res.status(403).json({ message: 'Not enrolled in this workshop' });

    participant.leaveTime = new Date();

    // Calculate duration
    if (participant.joinTime) {
      const diffMs = participant.leaveTime - participant.joinTime;
      const diffMins = Math.round(diffMs / 60000);
      participant.totalDurationMinutes = (participant.totalDurationMinutes || 0) + diffMins;

      // Mark partial if they stayed < 50% of workshop duration
      const workshop = await Workshop.findById(req.params.id);
      if (workshop && workshop.durationMinutes) {
        const threshold = workshop.durationMinutes * 0.5;
        if (participant.totalDurationMinutes < threshold) {
          participant.status = 'partial';
        } else {
          participant.status = 'attended';
        }
      }
    }
    await participant.save();
    res.json({ message: 'Leave time recorded', participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Creator: Get full participant list for a workshop ────────────────────────
export const getWorkshopParticipants = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, search } = req.query;
    let query = { workshopId: req.params.id };
    if (status && status !== 'all') query.status = status;

    let participants = await Participant.find(query)
      .populate('userId', 'name email avatar')
      .sort({ joinedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      participants = participants.filter(p =>
        p.userId?.name?.toLowerCase().includes(s) ||
        p.userId?.email?.toLowerCase().includes(s)
      );
    }

    const stats = {
      total: await Participant.countDocuments({ workshopId: req.params.id }),
      attended: await Participant.countDocuments({ workshopId: req.params.id, status: 'attended' }),
      partial: await Participant.countDocuments({ workshopId: req.params.id, status: 'partial' }),
      absent: await Participant.countDocuments({ workshopId: req.params.id, status: 'absent' }),
      registered: await Participant.countDocuments({ workshopId: req.params.id, status: 'registered' }),
    };

    res.json({ participants, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Creator: Get attendance report across all workshops ──────────────────────
export const getCreatorAttendanceReport = async (req, res) => {
  try {
    const workshops = await Workshop.find({ creatorId: req.user._id }).select('_id title scheduledDate status durationMinutes');

    const report = await Promise.all(workshops.map(async (w) => {
      const total      = await Participant.countDocuments({ workshopId: w._id });
      const attended   = await Participant.countDocuments({ workshopId: w._id, status: { $in: ['attended', 'partial'] } });
      const absent     = await Participant.countDocuments({ workshopId: w._id, status: 'absent' });
      const registered = await Participant.countDocuments({ workshopId: w._id, status: 'registered' });

      const avgDuration = await Participant.aggregate([
        { $match: { workshopId: w._id } },
        { $group: { _id: null, avg: { $avg: '$totalDurationMinutes' } } }
      ]);

      return {
        workshopId: w._id,
        title: w.title,
        scheduledDate: w.scheduledDate,
        status: w.status,
        durationMinutes: w.durationMinutes,
        stats: {
          total, attended, absent, registered,
          attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0,
          avgDurationMinutes: avgDuration[0]?.avg ? Math.round(avgDuration[0].avg) : 0,
        }
      };
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Creator: Manually mark a participant's status ────────────────────────────
export const markParticipantStatus = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId, status } = req.body;
    const participant = await Participant.findOne({ workshopId: req.params.id, userId });
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    participant.status = status;
    participant.attended = status === 'attended' || status === 'partial';
    await participant.save();
    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── User: Get own attendance history ─────────────────────────────────────────
export const getUserAttendanceHistory = async (req, res) => {
  try {
    const history = await Participant.find({ userId: req.user._id })
      .populate({
        path: 'workshopId',
        select: 'title scheduledDate durationMinutes category creatorId thumbnailUrl status',
        populate: { path: 'creatorId', select: 'name' }
      })
      .sort({ joinedAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
