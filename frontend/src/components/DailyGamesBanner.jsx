import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Flame, Check, ChevronLeft, ChevronRight, Play, Trophy, Sparkles } from 'lucide-react';
import { getPuzzleNumber, getTodayDateStr } from '../utils/gameGenerators';

export default function DailyGamesBanner({ onOpenGame, onOpenLeaderboard }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const todayStr = getTodayDateStr();

  const gamesConfig = [
    {
      id: 'queens',
      name: 'Queens',
      icon: '👑',
      bgClass: 'bg-purple-50 border-purple-200 text-purple-900',
      iconBg: 'bg-purple-600 text-white',
      puzzleNumber: getPuzzleNumber('queens', todayStr),
      description: 'Crown each color zone',
    },
    {
      id: 'tango',
      name: 'Tango',
      icon: '☀️',
      bgClass: 'bg-amber-50 border-amber-200 text-amber-900',
      iconBg: 'bg-amber-500 text-white',
      puzzleNumber: getPuzzleNumber('tango', todayStr),
      description: 'Balance suns & moons',
    },
  ];

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo?.token;
        if (!token) return;

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/games/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setStatus(res.data);
        }
      } catch (err) {
        console.error('Failed to load game status:', err);
      }
    };

    fetchStatus();
  }, []);

  const streakCount = status?.streak?.currentStreak || 0;

  const handleAction = (gameId) => {
    if (onOpenGame) {
      onOpenGame(gameId);
    } else {
      navigate(`/games?play=${gameId}`);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 shadow-sm border border-border my-6">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌄</span>
          <h3 className="font-extrabold text-gray-900 text-base md:text-lg tracking-tight">
            Your morning puzzle is ready
          </h3>
          {streakCount > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full border border-amber-200">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-bounce" />
              {streakCount}-day streak!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/games"
            className="text-xs font-bold text-primary hover:underline mr-2 flex items-center gap-1"
          >
            All Puzzles
          </Link>
          <button
            onClick={() => setScrollIndex((p) => Math.max(0, p - 1))}
            disabled={scrollIndex === 0}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScrollIndex((p) => Math.min(gamesConfig.length - 1, p + 1))}
            disabled={scrollIndex >= gamesConfig.length - 2}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gamesConfig.map((game) => {
          const gameStat = status?.games?.[game.id];
          const isCompleted = gameStat?.completed;
          const userStreak = streakCount;

          return (
            <div
              key={game.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 hover:shadow-md ${game.bgClass}`}
            >
              {/* Left Details */}
              <div className="flex items-center gap-3">
                {/* Icon with Completed Checkmark overlay */}
                <div className="relative">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm ${game.iconBg}`}>
                    {game.icon}
                  </div>
                  {isCompleted && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-gray-900">{game.name}</h4>
                    <span className="text-xs text-gray-500 font-medium">#{game.puzzleNumber}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {userStreak}-day streak
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <div>
                {isCompleted ? (
                  <button
                    onClick={() => handleAction(game.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-primary border border-primary/30 hover:bg-primary/5 transition shadow-sm"
                  >
                    Results
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(game.id)}
                    className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-primary hover:bg-blue-700 text-white shadow-sm hover:shadow transition flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    Play
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
