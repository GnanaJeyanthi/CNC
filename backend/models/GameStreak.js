import mongoose from 'mongoose';

const gameStreakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  maxStreak: {
    type: Number,
    default: 0,
  },
  lastPlayedDate: {
    type: String, // Format: YYYY-MM-DD
    default: '',
  },
  totalGamesPlayed: {
    type: Number,
    default: 0,
  },
  totalWins: {
    type: Number,
    default: 0,
  },
  gameStats: {
    zip: {
      played: { type: Number, default: 0 },
      bestTime: { type: Number, default: null },
      streak: { type: Number, default: 0 },
    },
    queens: {
      played: { type: Number, default: 0 },
      bestTime: { type: Number, default: null },
      streak: { type: Number, default: 0 },
    },
    tango: {
      played: { type: Number, default: 0 },
      bestTime: { type: Number, default: null },
      streak: { type: Number, default: 0 },
    },
  },
}, { timestamps: true });

const GameStreak = mongoose.model('GameStreak', gameStreakSchema);
export default GameStreak;
