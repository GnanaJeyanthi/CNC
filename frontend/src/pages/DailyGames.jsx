import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QueensGame from '../components/games/QueensGame';
import TangoGame from '../components/games/TangoGame';
import CelebrationModal from '../components/games/CelebrationModal';
import LeaderboardModal from '../components/games/LeaderboardModal';
import DailyGamesBanner from '../components/DailyGamesBanner';
import { Trophy, Flame, CheckCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { getTodayDateStr } from '../utils/gameGenerators';

export default function DailyGames() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeGame, setActiveGame] = useState(searchParams.get('play') || 'queens');
  const [gameStatus, setGameStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardGame, setLeaderboardGame] = useState('queens');

  useEffect(() => {
    const playParam = searchParams.get('play');
    if (playParam && ['queens', 'tango'].includes(playParam)) {
      setActiveGame(playParam);
    }
  }, [searchParams]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchGameStatus = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo?.token;
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/games/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setGameStatus(res.data);
      }
    } catch (err) {
      console.error('Error fetching game status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGameStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle Score Submission & Celebration
  const handleGameComplete = async ({ gameId, timeTaken, moves, hintsUsed }) => {
    // Immediate fallback data so celebration popup ALWAYS triggers smoothly
    const optimisticData = {
      gameId,
      timeTaken,
      avgTime: 24,
      streak: (gameStatus?.streak?.currentStreak || 0) + 1,
      puzzleNumber: 695,
      rank: 1,
      totalPlayers: 1,
      percentile: 95,
      hintsUsed: hintsUsed || 0,
      topScores: [
        {
          rank: 1,
          userName: user?.name || 'You',
          profilePhoto: user?.profilePhoto,
          role: user?.role,
          timeTaken,
          hintsUsed: hintsUsed || 0,
          isCurrentUser: true,
        }
      ]
    };

    setCelebrationData(optimisticData);
    setCelebrationOpen(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const token = userInfo?.token || user?.token;
      if (!token) return;

      const res = await axios.post(
        `${API_URL}/api/games/complete`,
        {
          gameId,
          date: getTodayDateStr(),
          timeTaken,
          moves,
          hintsUsed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success && res.data?.score) {
        setCelebrationData(res.data.score);
        fetchGameStatus(); // refresh streak and completion
      }
    } catch (err) {
      console.error('Error submitting score to server:', err);
    }
  };

  const currentStreak = gameStatus?.streak?.currentStreak || 0;
  const isCurrentGameCompleted = gameStatus?.games?.[activeGame]?.completed;

  const handleNextGame = () => {
    setCelebrationOpen(false);
    const games = ['queens', 'tango'];
    const nextIdx = (games.indexOf(activeGame) + 1) % games.length;
    const nextG = games[nextIdx];
    setActiveGame(nextG);
    setSearchParams({ play: nextG });
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="max-w-lg mx-auto py-20 px-6 text-center">
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl border border-primary/30">
            🧩
          </div>
          <h2 className="text-3xl font-black mb-3">Daily Mini-Games</h2>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Solve daily brain teasers, keep your streak alive, and challenge other creators & learners on the leaderboard! Sign in to start playing.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/signin')}
              className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition"
            >
              Sign In to Play
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-2xl transition border border-white/20"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Top Header & Streak Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl mb-8">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-2xl shadow-lg text-white">
              🧩
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Daily Puzzles
                <span className="text-xs bg-primary/20 text-blue-400 border border-blue-500/30 font-bold px-2.5 py-0.5 rounded-full">
                  New Daily at Midnight
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Train your mind & climb the community leaderboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-2xl text-amber-400 font-extrabold text-sm">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{currentStreak} Day Streak</span>
            </div>

            {/* Leaderboard Button */}
            <button
              onClick={() => {
                setLeaderboardGame(activeGame);
                setLeaderboardOpen(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl font-bold text-sm shadow-md transition"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Leaderboard</span>
            </button>
          </div>
        </div>

        {/* LinkedIn-style Game Switcher Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { id: 'queens', name: 'Queens', icon: '👑', desc: 'Crown each color zone' },
            { id: 'tango', name: 'Tango', icon: '☀️', desc: 'Balance Suns & Moons' },
          ].map((game) => {
            const isCompleted = gameStatus?.games?.[game.id]?.completed;
            const isActive = activeGame === game.id;

            return (
              <button
                key={game.id}
                onClick={() => {
                  setActiveGame(game.id);
                  setSearchParams({ play: game.id });
                }}
                className={`relative p-5 rounded-3xl border transition-all duration-300 text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-slate-800 to-slate-900 border-primary shadow-xl ring-2 ring-primary/40'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-3xl">{game.icon}</span>
                  {isCompleted && (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Solved
                    </span>
                  )}
                </div>
                <div>
                  <h3 className={`font-black text-lg ${isActive ? 'text-white' : 'text-slate-200'}`}>
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{game.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Game Board View */}
        <div className="bg-slate-900/40 rounded-3xl p-4 sm:p-8 border border-slate-800 shadow-2xl flex flex-col items-center">
          {activeGame === 'queens' && (
            <QueensGame
              key={`queens-${getTodayDateStr()}`}
              onComplete={handleGameComplete}
              isCompletedToday={gameStatus?.games?.queens?.completed}
              todayScore={gameStatus?.games?.queens}
            />
          )}

          {activeGame === 'tango' && (
            <TangoGame
              key={`tango-${getTodayDateStr()}`}
              onComplete={handleGameComplete}
              isCompletedToday={gameStatus?.games?.tango?.completed}
              todayScore={gameStatus?.games?.tango}
            />
          )}
        </div>
      </main>

      {/* Celebration Popup Modal */}
      <CelebrationModal
        isOpen={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        gameId={activeGame}
        scoreData={celebrationData}
        currentUser={user}
        onOpenLeaderboard={(gid) => {
          setLeaderboardGame(gid);
          setLeaderboardOpen(true);
        }}
        onPlayNext={handleNextGame}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        initialGame={leaderboardGame}
      />
    </div>
  );
}
