import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gameId: {
    type: String,
    enum: ['zip', 'queens', 'tango'],
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  puzzleNumber: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // In seconds
    required: true,
  },
  moves: {
    type: Number,
    default: 0,
  },
  hintsUsed: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

gameScoreSchema.index({ gameId: 1, date: 1, user: 1 }, { unique: true });

const GameScore = mongoose.model('GameScore', gameScoreSchema);
export default GameScore;
