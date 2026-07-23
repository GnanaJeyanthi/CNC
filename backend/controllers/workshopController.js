import Workshop from '../models/Workshop.js';
import Participant from '../models/Participant.js';
import { generateJitsiRoomName, getJitsiRoomUrl } from '../utils/jitsi.js';
import { generateNgrokLiveUrl } from '../utils/ngrok.js';
import { cloudinary, uploadBufferToCloudinary } from '../config/cloudinary.js';

// Create workshop
export const createWorkshop = async (req, res) => {
  try {
    const { title, description, category, price, durationMinutes, maxParticipants, scheduledDate, learningObjectives } = req.body || {};
    
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
