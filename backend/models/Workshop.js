import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String },
  publicId: { type: String },
}, { timestamps: true });

const waitlistEntrySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
});

const workshopSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  category:       { type: String, required: true },
  creatorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price:          { type: Number, required: true, min: 0 },
  scheduledDate:  { type: Date },
  durationMinutes:{ type: Number, default: 60 },
  status:         { type: String, enum: ['draft', 'scheduled', 'live', 'ended'], default: 'draft' },
  jitsiRoomName:  { type: String },
  ngrokUrl:       { type: String, default: '' },
  maxParticipants:{ type: Number, default: 50 },
  thumbnailUrl:   { type: String, default: '' },
  thumbnailPublicId: { type: String },
  recordingUrl:   { type: String, default: '' },
  recordingPublicId: { type: String },
  learningObjectives: [{ type: String }],
  studyMaterials: [studyMaterialSchema],

  // ── Feature: Reviews & Ratings ──────────────────────────────────────────────
  avgRating:   { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0, min: 0 },

  // ── Feature: Replay Store ───────────────────────────────────────────────────
  replayPublished: { type: Boolean, default: false },
  replayPrice:     { type: Number, default: 0, min: 0 },

  // ── Feature: Early Bird Pricing ─────────────────────────────────────────────
  earlyBirdPrice:    { type: Number, default: null },
  earlyBirdDeadline: { type: Date,   default: null },

  // ── Feature: Waitlist ────────────────────────────────────────────────────────
  waitlist: [waitlistEntrySchema],
}, { timestamps: true });

workshopSchema.index({ creatorId: 1, status: 1 });
workshopSchema.index({ scheduledDate: 1 });

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;
