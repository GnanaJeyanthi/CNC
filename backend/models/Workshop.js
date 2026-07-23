import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  publicId: { type: String },
}, { timestamps: true });

const workshopSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true, min: 0 },
  scheduledDate: { type: Date },
  durationMinutes: { type: Number, default: 60 },
  status: { type: String, enum: ['draft', 'scheduled', 'live', 'ended'], default: 'draft' },
  jitsiRoomName: { type: String },
  ngrokUrl: { type: String, default: '' },
  maxParticipants: { type: Number, default: 50 },
  thumbnailUrl: { type: String, default: '' },
  thumbnailPublicId: { type: String },
  recordingUrl: { type: String, default: '' },
  recordingPublicId: { type: String },
  learningObjectives: [{ type: String }],
  studyMaterials: [studyMaterialSchema],
}, { timestamps: true });

workshopSchema.index({ creatorId: 1, status: 1 });
workshopSchema.index({ scheduledDate: 1 });

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;
