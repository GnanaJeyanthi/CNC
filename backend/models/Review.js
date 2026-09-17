import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, default: '', maxlength: 1000 },
  photoUrl:   { type: String, default: '' },
  photoPublicId: { type: String, default: '' },
}, { timestamps: true });

// One review per user per workshop
reviewSchema.index({ workshopId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ workshopId: 1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
