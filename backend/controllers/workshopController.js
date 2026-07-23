import Workshop from '../models/Workshop.js';
import Participant from '../models/Participant.js';
import { generateJitsiRoomName, getJitsiRoomUrl } from '../utils/jitsi.js';
import { cloudinary } from '../config/cloudinary.js';

// Create workshop
export const createWorkshop = async (req, res) => {
  try {
    const { title, description, category, price, durationMinutes, maxParticipants, scheduledDate, learningObjectives } = req.body;
    const workshopData = {
      title, description, category,
      price: price ? Number(price) : 0,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      maxParticipants: maxParticipants ? Number(maxParticipants) : 50,
      creatorId: req.user._id,
    };
    if (learningObjectives) {
      workshopData.learningObjectives = Array.isArray(learningObjectives) ? learningObjectives : learningObjectives.split('\n');
    }
    if (scheduledDate) {
      workshopData.scheduledDate = new Date(scheduledDate);
      workshopData.status = 'scheduled';
    }
    if (req.file) {
      workshopData.thumbnailUrl = req.file.path;
      workshopData.thumbnailPublicId = req.file.filename;
    }
    const jitsiRoom = generateJitsiRoomName('temp');
    const workshop = await Workshop.create(workshopData);
    workshop.jitsiRoomName = generateJitsiRoomName(workshop._id);
    await workshop.save();
    res.status(201).json(workshop);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all workshops with search and filter
export const getAllWorkshops = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    const workshops = await Workshop.find(query).sort({ scheduledDate: 1, createdAt: -1 }).populate('creatorId', 'name avatar');
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
    if (req.file) {
      if (workshop.thumbnailPublicId) {
        await cloudinary.uploader.destroy(workshop.thumbnailPublicId);
      }
      updates.thumbnailUrl = req.file.path;
      updates.thumbnailPublicId = req.file.filename;
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
    workshop.status = 'live';
    await workshop.save();
    res.json({ workshop, jitsiUrl: getJitsiRoomUrl(workshop.jitsiRoomName) });
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
    if (req.file) {
      if (workshop.recordingPublicId) await cloudinary.uploader.destroy(workshop.recordingPublicId, { resource_type: 'video' });
      workshop.recordingUrl = req.file.path;
      workshop.recordingPublicId = req.file.filename;
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
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const material = {
      title: req.body.title || req.file.originalname || 'Untitled',
      fileUrl: req.file.path,
      fileType: req.file.originalname?.split('.').pop() || 'pdf',
      publicId: req.file.filename,
    };
    workshop.studyMaterials.push(material);
    await workshop.save();
    res.status(201).json(workshop);
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

// Join a workshop
export const joinWorkshop = async (req, res) => {
  try {
    const workshopId = req.params.id;
    const userId = req.user._id;
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) return res.status(404).json({ message: 'Workshop not found' });
    
    // Check if already joined
    const existing = await Participant.findOne({ workshopId, userId });
    if (existing) return res.status(400).json({ message: 'Already joined this workshop' });
    
    // Check max participants limit
    const participantCount = await Participant.countDocuments({ workshopId });
    if (participantCount >= workshop.maxParticipants) {
      return res.status(400).json({ message: 'Workshop is full' });
    }
    
    const participant = await Participant.create({ workshopId, userId });
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
