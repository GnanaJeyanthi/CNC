import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  joinedAt:   { type: Date, default: Date.now },

  // Live session tracking
  joinTime:   { type: Date },
  leaveTime:  { type: Date },
  totalDurationMinutes: { type: Number, default: 0 },

  // Attendance
  attended:   { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['registered', 'attended', 'absent', 'partial'],
    default: 'registered'
  },
}, { timestamps: true });

participantSchema.index({ workshopId: 1, userId: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);
export default Participant;
