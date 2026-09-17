import Review from '../models/Review.js';
import Participant from '../models/Participant.js';
import Workshop from '../models/Workshop.js';
import { cloudinary, uploadBufferToCloudinary } from '../config/cloudinary.js';

// ── POST /api/reviews/:workshopId — Create a review (attended users only) ────
export const createReview = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const userId = req.user._id;

    // Verify user actually attended the workshop
    const participant = await Participant.findOne({ workshopId, userId });
    if (!participant) {
      return res.status(403).json({ message: 'You must attend the workshop to leave a review' });
    }
    if (participant.status !== 'attended' && participant.status !== 'partial') {
      return res.status(403).json({ message: 'Only participants who attended can leave a review' });
    }

    // Check for existing review
    const existing = await Review.findOne({ workshopId, userId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this workshop' });
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const reviewData = {
      workshopId,
      userId,
      rating: Number(rating),
      comment: comment ? String(comment).trim() : '',
    };

    // Handle optional photo upload
    if (req.file && req.file.buffer) {
      try {
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
          folder: 'castncart/reviews',
          resource_type: 'auto',
        });
        reviewData.photoUrl = uploadResult.secure_url;
        reviewData.photoPublicId = uploadResult.public_id;
      } catch (err) {
        console.warn('Review photo upload warning:', err.message);
      }
    }

    const review = await Review.create(reviewData);
    await review.populate('userId', 'name profilePhoto');

    // Update workshop's average rating
    await updateWorkshopRating(workshopId);

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this workshop' });
    }
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/reviews/:workshopId — Get all reviews for a workshop ─────────────
export const getWorkshopReviews = async (req, res) => {
  try {
    const { workshopId } = req.params;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ workshopId })
        .populate('userId', 'name profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ workshopId }),
    ]);

    // Compute rating breakdown
    const breakdown = await Review.aggregate([
      { $match: { workshopId: new (await import('mongoose')).default.Types.ObjectId(workshopId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach(b => { ratingBreakdown[b._id] = b.count; });

    const avgRating = total > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / Math.min(reviews.length, total)
      : 0;

    res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
      ratingBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/reviews/:reviewId — Delete own review ────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    if (review.photoPublicId) {
      await cloudinary.uploader.destroy(review.photoPublicId);
    }

    await review.deleteOne();
    await updateWorkshopRating(review.workshopId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Helper: Recalculate and store workshop avgRating ─────────────────────────
async function updateWorkshopRating(workshopId) {
  try {
    const result = await Review.aggregate([
      { $match: { workshopId: new (await import('mongoose')).default.Types.ObjectId(String(workshopId)) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const avgRating   = result[0]?.avg   ? Math.round(result[0].avg * 10) / 10 : 0;
    const reviewCount = result[0]?.count ?? 0;
    await Workshop.findByIdAndUpdate(workshopId, { avgRating, reviewCount });
  } catch (err) {
    console.warn('updateWorkshopRating error:', err.message);
  }
}
