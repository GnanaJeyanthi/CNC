import GameScore from '../models/GameScore.js';
import GameStreak from '../models/GameStreak.js';

// Helper to get today's date in YYYY-MM-DD
const getTodayDateStr = () => {
  return new Date().toISOString().split('T')[0];
};

// Helper to calculate difference in calendar days
const getDayDifference = (dateStr1, dateStr2) => {
  if (!dateStr1 || !dateStr2) return 999;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// Calculate puzzle number based on start epoch
const getPuzzleNumberForGame = (gameId, dateStr) => {
  const baseDate = new Date('2025-01-01');
  const targetDate = new Date(dateStr || getTodayDateStr());
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const offsets = {
    zip: 534,
    queens: 855,
    tango: 695,
  };

  return (offsets[gameId] || 100) + Math.max(0, diffDays);
};

// @desc    Get user's daily status & streaks
// @route   GET /api/games/status
// @access  Private
export const getDailyStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayDateStr();

    let streakRecord = await GameStreak.findOne({ user: userId });
    if (!streakRecord) {
      streakRecord = await GameStreak.create({ user: userId });
    }

    // Check if streak is broken (more than 1 day missed)
    if (streakRecord.lastPlayedDate) {
      const dayDiff = getDayDifference(streakRecord.lastPlayedDate, today);
      if (dayDiff > 1) {
        streakRecord.currentStreak = 0;
        await streakRecord.save();
      }
    }

    // Fetch today's scores for this user
    const todayScores = await GameScore.find({
      user: userId,
      date: today,
    });

    const games = ['queens', 'tango'];
    const gamesStatus = {};

    for (const g of games) {
      const score = todayScores.find(s => s.gameId === g);
      const puzzleNum = getPuzzleNumberForGame(g, today);

      // Global stats for today
      const allTodayScores = await GameScore.find({ gameId: g, date: today });
      const totalPlayed = allTodayScores.length;
      const avgTime = totalPlayed > 0 
        ? Math.round(allTodayScores.reduce((acc, curr) => acc + curr.timeTaken, 0) / totalPlayed)
        : 30;

      gamesStatus[g] = {
        gameId: g,
        puzzleNumber: puzzleNum,
        completed: !!score,
        timeTaken: score ? score.timeTaken : null,
        hintsUsed: score ? score.hintsUsed : 0,
        moves: score ? score.moves : 0,
        avgTimeToday: avgTime,
        totalPlayersToday: totalPlayed,
      };
    }

    res.json({
      success: true,
      date: today,
      streak: {
        currentStreak: streakRecord.currentStreak,
        maxStreak: streakRecord.maxStreak,
        lastPlayedDate: streakRecord.lastPlayedDate,
        totalWins: streakRecord.totalWins,
      },
      games: gamesStatus,
    });
  } catch (error) {
    console.error('getDailyStatus error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving game status' });
  }
};

// @desc    Submit score for completed game
// @route   POST /api/games/complete
// @access  Private
export const submitGameScore = async (req, res) => {
  try {
    const userId = req.user._id;
    const { gameId, date, timeTaken, moves = 0, hintsUsed = 0 } = req.body;
    const scoreDate = date || getTodayDateStr();

    if (!['zip', 'queens', 'tango'].includes(gameId)) {
      return res.status(400).json({ success: false, message: 'Invalid game identifier' });
    }

    if (typeof timeTaken !== 'number' || timeTaken <= 0) {
      return res.status(400).json({ success: false, message: 'Valid timeTaken is required' });
    }

    const puzzleNumber = getPuzzleNumberForGame(gameId, scoreDate);

    // Check if score already exists for today
    let existingScore = await GameScore.findOne({
      user: userId,
      gameId,
      date: scoreDate,
    });

    let isNewCompletion = false;

    if (!existingScore) {
      existingScore = await GameScore.create({
        user: userId,
        gameId,
        date: scoreDate,
        puzzleNumber,
        timeTaken,
        moves,
        hintsUsed,
        completed: true,
        completedAt: new Date(),
      });
      isNewCompletion = true;
    } else {
      // If played again and achieved better time, update it
      if (timeTaken < existingScore.timeTaken) {
        existingScore.timeTaken = timeTaken;
        existingScore.hintsUsed = Math.min(existingScore.hintsUsed, hintsUsed);
        existingScore.moves = moves || existingScore.moves;
        await existingScore.save();
      }
    }

    // Update Streak
    let streakRecord = await GameStreak.findOne({ user: userId });
    if (!streakRecord) {
      streakRecord = new GameStreak({ user: userId });
    }

    if (isNewCompletion) {
      const lastDate = streakRecord.lastPlayedDate;
      if (!lastDate) {
        streakRecord.currentStreak = 1;
      } else if (lastDate === scoreDate) {
        // Already played a game today; streak preserved
      } else {
        const dayDiff = getDayDifference(lastDate, scoreDate);
        if (dayDiff === 1) {
          streakRecord.currentStreak += 1;
        } else {
          streakRecord.currentStreak = 1;
        }
      }

      streakRecord.maxStreak = Math.max(streakRecord.maxStreak, streakRecord.currentStreak);
      streakRecord.lastPlayedDate = scoreDate;
      streakRecord.totalWins += 1;
      streakRecord.totalGamesPlayed += 1;

      // Update game-specific stats
      if (!streakRecord.gameStats) {
        streakRecord.gameStats = { zip: {}, queens: {}, tango: {} };
      }
      if (!streakRecord.gameStats[gameId]) {
        streakRecord.gameStats[gameId] = { played: 0, bestTime: null, streak: 0 };
      }

      streakRecord.gameStats[gameId].played = (streakRecord.gameStats[gameId].played || 0) + 1;
      const currentBest = streakRecord.gameStats[gameId].bestTime;
      if (!currentBest || timeTaken < currentBest) {
        streakRecord.gameStats[gameId].bestTime = timeTaken;
      }

      await streakRecord.save();
    }

    // Calculate Leaderboard Rank & Percentile for today
    const allTodayScores = await GameScore.find({ gameId, date: scoreDate }).sort({ timeTaken: 1 });
    const totalPlayers = allTodayScores.length;
    const userRankIndex = allTodayScores.findIndex(s => s.user.toString() === userId.toString());
    const rank = userRankIndex !== -1 ? userRankIndex + 1 : 1;

    const avgTime = totalPlayers > 0
      ? Math.round(allTodayScores.reduce((acc, curr) => acc + curr.timeTaken, 0) / totalPlayers)
      : timeTaken;

    // Calculate percentile: percentage of players slower than this user
    let percentile = 90;
    if (totalPlayers > 1) {
      const slowerCount = totalPlayers - rank;
      percentile = Math.max(10, Math.min(99, Math.round((slowerCount / (totalPlayers - 1)) * 100)));
    } else {
      percentile = 99;
    }

    // Fetch top scores populated with user info for immediate celebration display
    const populatedTodayScores = await GameScore.find({ gameId, date: scoreDate })
      .sort({ timeTaken: 1 })
      .limit(10)
      .populate('user', 'name profilePhoto role');

    const topScoresList = populatedTodayScores
      .filter(s => s.user)
      .map((s, idx) => ({
        rank: idx + 1,
        id: s._id,
        userName: s.user.name,
        profilePhoto: s.user.profilePhoto,
        role: s.user.role,
        timeTaken: s.timeTaken,
        hintsUsed: s.hintsUsed,
        isCurrentUser: s.user._id.toString() === userId.toString(),
      }));

    res.json({
      success: true,
      message: 'Score recorded successfully',
      score: {
        gameId,
        date: scoreDate,
        puzzleNumber,
        timeTaken: existingScore.timeTaken,
        hintsUsed: existingScore.hintsUsed,
        rank,
        totalPlayers,
        avgTime,
        percentile,
        streak: streakRecord.currentStreak,
        maxStreak: streakRecord.maxStreak,
        topScores: topScoresList,
      }
    });
  } catch (error) {
    console.error('submitGameScore error:', error);
    res.status(500).json({ success: false, message: 'Server error submitting score' });
  }
};

// @desc    Get leaderboard for a game
// @route   GET /api/games/leaderboard/:gameId
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { date, type = 'daily' } = req.query;
    const targetDate = date || getTodayDateStr();

    if (!['queens', 'tango'].includes(gameId)) {
      return res.status(400).json({ success: false, message: 'Invalid game identifier' });
    }

    if (type === 'streak') {
      // Top streaks across users
      const topStreaks = await GameStreak.find({ currentStreak: { $gt: 0 } })
        .sort({ currentStreak: -1, totalWins: -1 })
        .limit(50)
        .populate('user', 'name profilePhoto role');

      const formatted = topStreaks
        .filter(s => s.user)
        .map((s, idx) => ({
          rank: idx + 1,
          user: s.user,
          streak: s.currentStreak,
          totalWins: s.totalWins,
          isCurrentUser: req.user ? s.user._id.toString() === req.user._id.toString() : false,
        }));

      return res.json({ success: true, type: 'streak', leaderboard: formatted });
    }

    // Daily leaderboard for specific game & date
    const scores = await GameScore.find({
      gameId,
      date: targetDate,
    })
      .sort({ timeTaken: 1 })
      .limit(100)
      .populate('user', 'name profilePhoto role');

    const leaderboard = scores
      .filter(s => s.user)
      .map((s, idx) => ({
        rank: idx + 1,
        id: s._id,
        user: s.user,
        timeTaken: s.timeTaken,
        hintsUsed: s.hintsUsed,
        moves: s.moves,
        completedAt: s.completedAt,
        isCurrentUser: req.user ? s.user._id.toString() === req.user._id.toString() : false,
      }));

    res.json({
      success: true,
      gameId,
      date: targetDate,
      puzzleNumber: getPuzzleNumberForGame(gameId, targetDate),
      leaderboard,
      totalPlayers: leaderboard.length,
    });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving leaderboard' });
  }
};

// @desc    Get user's game stats & history
// @route   GET /api/games/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const streakRecord = await GameStreak.findOne({ user: userId }) || {
      currentStreak: 0,
      maxStreak: 0,
      totalWins: 0,
      totalGamesPlayed: 0,
    };

    const recentScores = await GameScore.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      streak: streakRecord,
      history: recentScores,
    });
  } catch (error) {
    console.error('getUserStats error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving user stats' });
  }
};
