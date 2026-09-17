import Workshop from '../models/Workshop.js';
import Participant from '../models/Participant.js';
import Notification from '../models/Notification.js';
import { generateJitsiRoomName, getJitsiRoomUrl } from '../utils/jitsi.js';
import { generateNgrokLiveUrl } from '../utils/ngrok.js';
import { cloudinary, uploadBufferToCloudinary } from '../config/cloudinary.js';

// Helper: get effective price (early bird or regular)
function getEffectivePrice(workshop) {
  if (
    workshop.earlyBirdPrice != null &&
    workshop.earlyBirdDeadline &&
    new Date() < new Date(workshop.earlyBirdDeadline)
  ) {
    return { price: workshop.earlyBirdPrice, isEarlyBird: true };
  }
  return { price: workshop.price, isEarlyBird: false };
}

// Create workshop
export const createWorkshop = async (req, res) => {
  try {
    const { title, description, category, price, durationMinutes, maxParticipants, scheduledDate, learningObjectives, earlyBirdPrice, earlyBirdDeadline } = req.body || {};
    
    const parsedPrice = Number(price);
    const parsedDuration = Number(durationMinutes);
    const parsedMax = Number(maxParticipants);

    const workshopData = {
      title: (title && String(title).trim()) ? String(title).trim() : 'Untitled Class',
      description: description ? String(description) : '',
      category: (category && String(category).trim()) ? String(category).trim() : 'General',
      price: !isNaN(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0,
      durationMinutes: !isNaN(parsedDuration) && parsedDuration > 0 ? parsedDuration : 60,
      maxParticipants: !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : 50,
      creatorId: req.user._id,
    };

    if (learningObjectives) {
      workshopData.learningObjectives = Array.isArray(learningObjectives)
        ? learningObjectives
        : typeof learningObjectives === 'string'
          ? learningObjectives.split('\n').filter(Boolean)
          : [];
    }

    if (scheduledDate && !isNaN(new Date(scheduledDate).getTime())) {
      workshopData.scheduledDate = new Date(scheduledDate);
      workshopData.status = 'scheduled';
    }

    if (earlyBirdPrice != null && !isNaN(Number(earlyBirdPrice))) {
      workshopData.earlyBirdPrice = Number(earlyBirdPrice);
    }
    if (earlyBirdDeadline && !isNaN(new Date(earlyBirdDeadline).getTime())) {
      workshopData.earlyBirdDeadline = new Date(earlyBirdDeadline);
    }

    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
          folder: 'castncart/thumbnails',
          resource_type: 'auto',
        });
        if (uploadResult && uploadResult.secure_url) {
          workshopData.thumbnailUrl = uploadResult.secure_url;
          workshopData.thumbnailPublicId = uploadResult.public_id || '';
        }
      } catch (uploadErr) {
        console.warn('Cloudinary thumbnail upload warning:', uploadErr.message);
      }
    }

    const workshop = await Workshop.create(workshopData);
    workshop.jitsiRoomName = generateJitsiRoomName(workshop._id);
    workshop.ngrokUrl = generateNgrokLiveUrl(workshop._id);
    await workshop.save();

    return res.status(201).json(workshop);
  } catch (error) {
    console.error('Create Workshop Error Detail:', error);
    return res.status(500).json({ message: error.message || 'Failed to create workshop' });
  }
};

// Get all workshops with search and filter
export const getAllWorkshops = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }
    const workshops = await Workshop.find(query)
      .sort({ scheduledDate: 1, createdAt: -1 })
      .populate('creatorId', 'name email profilePhoto');
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get creator's workshops
export const getCreatorWorkshops = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [workshops, total] = await Promise.all([
      Workshop.find({ creatorId: req.params.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Workshop.countDocuments({ creatorId: req.params.id }),
    ]);
    res.json({ workshops, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single workshop
export const getWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).populate('creatorId', 'name email');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update workshop
export const updateWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updates = req.body;
    if (req.file && req.file.buffer) {
      try {
        if (workshop.thumbnailPublicId) {
          await cloudinary.uploader.destroy(workshop.thumbnailPublicId);
        }
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, { folder: 'castncart/thumbnails' });
        updates.thumbnailUrl = uploadResult.secure_url;
        updates.thumbnailPublicId = uploadResult.public_id;
      } catch (err) {
        console.warn('Thumbnail upload error:', err.message);
      }
    }
    Object.assign(workshop, updates);
    await workshop.save();
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete workshop
export const deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (workshop.thumbnailPublicId) await cloudinary.uploader.destroy(workshop.thumbnailPublicId);
    if (workshop.recordingPublicId) await cloudinary.uploader.destroy(workshop.recordingPublicId, { resource_type: 'video' });
    await Participant.deleteMany({ workshopId: workshop._id });
    await workshop.deleteOne();
    res.json({ message: 'Workshop deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Schedule workshop
export const scheduleWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    workshop.scheduledDate = new Date(req.body.scheduledDate);
    workshop.status = 'scheduled';
    await workshop.save();
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start workshop (go live)
export const startWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!workshop.jitsiRoomName) {
      workshop.jitsiRoomName = generateJitsiRoomName(workshop._id);
    }
    if (!workshop.ngrokUrl || workshop.ngrokUrl.includes('castncart-live.ngrok-free.app')) {
      workshop.ngrokUrl = generateNgrokLiveUrl(workshop._id);
    }
    workshop.status = 'live';
    await workshop.save();
    
    res.json({ workshop, jitsiUrl: getJitsiRoomUrl(workshop.jitsiRoomName), liveLink: workshop.ngrokUrl, ngrokUrl: workshop.ngrokUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// End workshop
export const endWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    workshop.status = 'ended';
    await workshop.save();
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload recording
export const uploadRecordingHandler = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Support file upload or external URL
    if (req.file && req.file.buffer) {
      try {
        if (workshop.recordingPublicId) await cloudinary.uploader.destroy(workshop.recordingPublicId, { resource_type: 'video' });
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, { folder: 'castncart/recordings', resource_type: 'video' });
        workshop.recordingUrl = uploadResult.secure_url;
        workshop.recordingPublicId = uploadResult.public_id;
      } catch (err) {
        console.warn('Recording upload warning:', err.message);
      }
    } else if (req.body.recordingUrl) {
      workshop.recordingUrl = req.body.recordingUrl;
      workshop.recordingPublicId = '';
    } else {
      return res.status(400).json({ message: 'Provide a recording file or URL' });
    }
    await workshop.save();
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload study material
export const uploadMaterialHandler = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!req.file || !req.file.buffer) return res.status(400).json({ message: 'No file uploaded' });
    try {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, { folder: 'castncart/materials', resource_type: 'raw' });
      const material = {
        title: req.body.title || req.file.originalname || 'Untitled',
        fileUrl: uploadResult.secure_url,
        fileType: req.file.originalname?.split('.').pop() || 'pdf',
        publicId: uploadResult.public_id,
      };
      workshop.studyMaterials.push(material);
      await workshop.save();
      res.status(201).json(workshop);
    } catch (err) {
      res.status(500).json({ message: err.message || 'Failed to upload material' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete study material
export const deleteMaterial = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const material = workshop.studyMaterials.id(req.params.materialId);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    if (material.publicId) await cloudinary.uploader.destroy(material.publicId, { resource_type: 'raw' });
    workshop.studyMaterials.pull(req.params.materialId);
    await workshop.save();
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get participants
export const getParticipants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const [participants, total] = await Promise.all([
      Participant.find({ workshopId: req.params.id }).populate('userId', 'name email').skip(skip).limit(limit),
      Participant.countDocuments({ workshopId: req.params.id }),
    ]);
    res.json({ participants, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if current user is enrolled
export const checkEnrollment = async (req, res) => {
  try {
    const participant = await Participant.findOne({ workshopId: req.params.id, userId: req.user._id });
    res.json({ isEnrolled: !!participant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join a workshop (free) — if full, redirect to waitlist
export const joinWorkshop = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user._id;
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    // Check if already a participant
    const existing = await Participant.findOne({ workshopId, userId });
    if (existing) return res.status(400).json({ message: 'Already joined this workshop' });

    // Check if already on waitlist
    const onWaitlist = workshop.waitlist.some(w => w.userId.toString() === userId.toString());
    if (onWaitlist) return res.status(400).json({ message: 'Already on the waitlist' });

    // Check max participants limit
    const participantCount = await Participant.countDocuments({ workshopId });
    if (participantCount >= workshop.maxParticipants) {
      // Add to waitlist instead
      workshop.waitlist.push({ userId });
      await workshop.save();
      return res.status(200).json({ waitlisted: true, message: 'Workshop is full. You have been added to the waitlist.' });
    }

    const participant = await Participant.create({ workshopId, userId });

    // Create enrollment notification for Student
    if (workshop.scheduledDate) {
      await Notification.create({
        userId,
        type: 'workshop_reminder',
        title: `Reminder: "${workshop.title}" is coming up!`,
        message: `Your workshop starts on ${new Date(workshop.scheduledDate).toLocaleDateString()}. Get ready!`,
        link: `/workshops/${workshopId}`,
      });
    }

    // Create enrollment notification for Creator
    await Notification.create({
      userId: workshop.creatorId,
      type: 'new_enrollment',
      title: `🎉 New Student Enrolled!`,
      message: `${req.user.name} has just enrolled in your masterclass: "${workshop.title}".`,
      link: `/dashboard/creator/workshops`,
    });

    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join waitlist explicitly
export const joinWaitlist = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user._id;
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const alreadyParticipant = await Participant.findOne({ workshopId, userId });
    if (alreadyParticipant) return res.status(400).json({ message: 'Already enrolled in this workshop' });

    const alreadyWaiting = workshop.waitlist.some(w => w.userId.toString() === userId.toString());
    if (alreadyWaiting) return res.status(400).json({ message: 'Already on the waitlist' });

    workshop.waitlist.push({ userId });
    await workshop.save();
    res.json({ message: 'Added to waitlist', position: workshop.waitlist.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave a workshop (opens a spot for waitlist)
export const leaveWorkshop = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user._id;

    const participant = await Participant.findOne({ workshopId, userId });
    if (!participant) return res.status(404).json({ message: 'Not enrolled in this workshop' });

    await participant.deleteOne();

    // Promote first person from waitlist
    const workshop = await Workshop.findById(workshopId);
    if (workshop && workshop.waitlist.length > 0) {
      const next = workshop.waitlist.shift();
      await workshop.save();
      await Participant.create({ workshopId, userId: next.userId });
      // Notify promoted user
      await Notification.create({
        userId: next.userId,
        type: 'waitlist_promoted',
        title: `Great news! A spot opened up in "${workshop.title}"`,
        message: 'You have been moved off the waitlist and are now enrolled!',
        link: `/workshops/${workshopId}`,
      });
    }

    res.json({ message: 'Left workshop successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove self from waitlist
export const leaveWaitlist = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user._id;
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });

    const idx = workshop.waitlist.findIndex(w => w.userId.toString() === userId.toString());
    if (idx === -1) return res.status(404).json({ message: 'Not on waitlist' });

    workshop.waitlist.splice(idx, 1);
    await workshop.save();
    res.json({ message: 'Removed from waitlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check waitlist status for current user
export const checkWaitlist = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    const idx = workshop.waitlist.findIndex(w => w.userId.toString() === req.user._id.toString());
    res.json({ onWaitlist: idx !== -1, position: idx !== -1 ? idx + 1 : null, total: workshop.waitlist.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publish recording as replay
export const publishReplay = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (workshop.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.body.recordingUrl) {
      workshop.recordingUrl = req.body.recordingUrl;
    }
    if (!workshop.recordingUrl) {
      return res.status(400).json({ message: 'No recording uploaded yet. Upload a recording file or provide a video URL.' });
    }

    workshop.replayPublished = req.body.published !== false && req.body.replayPublished !== false; // default true
    if (req.body.replayPrice != null) workshop.replayPrice = Number(req.body.replayPrice);
    await workshop.save();

    // Notify all attendees that replay is available
    if (workshop.replayPublished) {
      const attendees = await Participant.find({ workshopId: workshop._id, status: { $in: ['attended', 'partial'] } });
      const notifications = attendees.map(p => ({
        userId: p.userId,
        type: 'replay_published',
        title: `Replay available: "${workshop.title}"`,
        message: 'The recording from your workshop is now available to watch anytime.',
        link: `/workshops/${workshop._id}`,
      }));
      if (notifications.length) await Notification.insertMany(notifications);
    }

    res.json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get replay (check access — attended = free, others need paid order)
export const getReplay = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    if (!workshop.replayPublished) return res.status(404).json({ message: 'Replay not available' });

    const userId = req.user?._id;

    // Creator always has access
    if (workshop.creatorId.toString() === userId?.toString()) {
      return res.json({ url: workshop.recordingUrl, access: 'creator' });
    }

    // Check if attended (free access)
    const participant = await Participant.findOne({ workshopId: workshop._id, userId, status: { $in: ['attended', 'partial'] } });
    if (participant) {
      return res.json({ url: workshop.recordingUrl, access: 'attendee' });
    }

    // Check if purchased replay
    const { default: Order } = await import('./orderController.js').then(() => import('../models/Order.js'));
    const paidOrder = await Order.findOne({
      buyerId: userId,
      'items.itemId': workshop._id,
      'items.itemModel': 'Replay',
      status: 'paid',
    });
    if (paidOrder) {
      return res.json({ url: workshop.recordingUrl, access: 'purchased' });
    }

    // No access — return replay info for purchase
    return res.status(403).json({
      message: 'Purchase required to watch replay',
      replayPrice: workshop.replayPrice,
      workshopId: workshop._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get effective price (early bird vs normal)
export const getEffectivePriceAPI = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id).select('price earlyBirdPrice earlyBirdDeadline');
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    const { price, isEarlyBird } = getEffectivePrice(workshop);
    res.json({
      effectivePrice: price,
      isEarlyBird,
      originalPrice: workshop.price,
      earlyBirdPrice: workshop.earlyBirdPrice,
      earlyBirdDeadline: workshop.earlyBirdDeadline,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
