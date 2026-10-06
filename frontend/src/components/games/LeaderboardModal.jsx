import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Flame, Clock, X, Award, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function LeaderboardModal({ isOpen, onClose, initialGame = 'queens' }) {
  const [activeGame, setActiveGame] = useState(initialGame);
  const [tabType, setTabType] = useState('daily'); // 'daily' | 'streak'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialGame) setActiveGame(initialGame);
  }, [initialGame]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo?.token;
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(
          `${API_URL}/api/games/leaderboard/${activeGame}?type=${tabType}`,
          config
        );

        if (res.data.success) {
          setLeaderboard(res.data.leaderboard || []);
        }
      } catch (err) {
        console.error('Leaderboard error:', err);
        setError('Unable to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isOpen, activeGame, tabType]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const gameTitles = {
    queens: '👑 Queens Puzzle',
    tango: '☀️ Tango Puzzle',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl shadow-lg">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black">Daily Leaderboard</h3>
              <p className="text-xs text-slate-300">Compete with teachers and fellow learners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Game Tabs */}
        <div className="bg-slate-100 p-2 flex gap-2 border-b border-gray-200">
          {[
            { id: 'queens', label: 'Queens', icon: '👑' },
            { id: 'tango', label: 'Tango', icon: '☀️' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGame(g.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition ${
                activeGame === g.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>

        {/* Mode Selector (Today's Speed vs Top Streaks) */}
        <div className="px-6 py-3 flex items-center justify-between bg-white border-b border-gray-100">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setTabType('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabType === 'daily'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Today's Speed
            </button>
            <button
              onClick={() => setTabType('streak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                tabType === 'streak'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Top Streaks
            </button>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {tabType === 'daily' ? 'Fastest solves today' : 'Highest active daily streaks'}
          </span>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Fetching leaderboard standings...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 text-sm">
              {error}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">🎯</div>
              <p className="font-bold text-gray-600">No completions yet today!</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to solve today's puzzle and claim #1 spot!</p>
            </div>
          ) : (
            leaderboard.map((entry, idx) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;

              return (
                <div
                  key={entry.id || entry.user?._id || idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition border ${
                    entry.isCurrentUser
                      ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        isFirst
                          ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300'
                          : isSecond
                          ? 'bg-slate-300 text-slate-900'
                          : isThird
                          ? 'bg-amber-700 text-amber-100'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : entry.rank}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center font-bold text-primary">
                      {entry.user?.profilePhoto ? (
                        <img
                          src={entry.user.profilePhoto}
                          alt={entry.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        entry.user?.name ? entry.user.name[0].toUpperCase() : <UserIcon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Name & Role/Badges */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {entry.user?.name || 'Anonymous Player'}
                        </span>
                        {entry.isCurrentUser && (
                          <span className="bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                        {entry.user?.role === 'Creator' && (
                          <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Teacher
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tabType === 'daily' ? (
                          entry.hintsUsed === 0 ? (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              ✨ Perfect (0 Hints)
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">
                              {entry.hintsUsed} hint{entry.hintsUsed > 1 ? 's' : ''} used
                            </span>
                          )
                        ) : (
                          <span className="text-[11px] text-gray-500 font-medium">
                            {entry.totalWins || 0} total puzzles solved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score / Time */}
                  <div className="text-right">
                    {tabType === 'daily' ? (
                      <div>
                        <p className="text-base font-black text-gray-900 tracking-tight">
                          {formatTime(entry.timeTaken)}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">completion time</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 font-black text-base bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                        <span>{entry.streak} days</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Updates in real-time as players complete daily puzzles</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
