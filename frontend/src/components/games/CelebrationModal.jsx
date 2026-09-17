import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Share2, Copy, Send, Trophy, Flame, Brain, Clock, X, CheckCircle, ChevronRight, ChevronLeft, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function CelebrationModal({
  isOpen,
  onClose,
  gameId = 'zip',
  scoreData = {},
  currentUser = null,
  onOpenLeaderboard,
  onPlayNext,
}) {
  const [copied, setCopied] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger celebratory confetti explosion
    const count = 200;
    const defaults = { origin: { y: 0.6 }, zIndex: 99999 };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    timeTaken = 15,
    avgTime = 25,
    streak = 1,
    puzzleNumber = 534,
    rank = 1,
    totalPlayers = 1,
    percentile = 85,
    hintsUsed = 0,
    topScores = [],
  } = scoreData || {};

  const formatTime = (secs) => {
    if (secs === null || secs === undefined) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const gameNames = {
    zip: 'Zip',
    queens: 'Queens',
    tango: 'Tango',
  };

  const gameIcons = {
    zip: '🌀',
    queens: '👑',
    tango: '☀️',
  };

  const currentGameTitle = gameNames[gameId] || 'Daily Game';

  const shareText = `🧩 CastNCart ${currentGameTitle} #${puzzleNumber}\n⏱️ Time: ${formatTime(timeTaken)} (Avg: ${formatTime(avgTime)})\n🔥 Streak: ${streak} day${streak > 1 ? 's' : ''}\n🏆 Rank: #${rank} of ${totalPlayers} (Top ${100 - percentile > 0 ? 100 - percentile : 5}%)\nPlay now on CastNCart!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 pt-7 text-white relative overflow-hidden flex-shrink-0">
          <div className="text-center mb-4">
            <span className="inline-block bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-1.5 shadow-sm">
              ✨ Puzzle Solved!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              Congratulations on solving {currentGameTitle}!
            </h2>
            {currentUser?.name && (
              <p className="text-xs text-orange-100 font-semibold mt-0.5">
                Outstanding work, {currentUser.name}! 🌟
              </p>
            )}
          </div>

          {/* Cards Carousel Header */}
          <div className="relative flex items-center justify-center gap-3">
            {/* Slide 1: Streak */}
            <div
              onClick={() => setActiveSlide(0)}
              className={`cursor-pointer transition-all duration-300 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center backdrop-blur-md ${
                activeSlide === 0
                  ? 'bg-white text-gray-900 shadow-xl scale-105 w-40'
                  : 'bg-white/20 text-white hover:bg-white/30 w-28 opacity-80'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Streak</p>
              <p className="text-lg font-extrabold">{streak}-day</p>
              <p className="text-[9px] text-gray-400">win streak</p>
            </div>

            {/* Slide 2: Time Taken (Main Card) */}
            <div
              onClick={() => setActiveSlide(1)}
              className={`cursor-pointer transition-all duration-300 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center backdrop-blur-md ${
                activeSlide === 1
                  ? 'bg-white text-gray-900 shadow-xl scale-105 w-44'
                  : 'bg-white/20 text-white hover:bg-white/30 w-28 opacity-80'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-xl shadow-inner mb-1">
                {gameIcons[gameId] || '✨'}
              </div>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">{formatTime(timeTaken)}</p>
              <p className="text-[11px] font-medium text-gray-500">
                Today's avg: <span className="font-bold">{formatTime(avgTime)}</span>
              </p>
            </div>

            {/* Slide 3: Intelligence / Percentile */}
            <div
              onClick={() => setActiveSlide(2)}
              className={`cursor-pointer transition-all duration-300 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center backdrop-blur-md ${
                activeSlide === 2
                  ? 'bg-white text-gray-900 shadow-xl scale-105 w-40'
                  : 'bg-white/20 text-white hover:bg-white/30 w-28 opacity-80'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center mb-1">
                <Brain className="w-5 h-5 text-rose-500" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Percentile</p>
              <p className="text-lg font-extrabold">Top {Math.max(5, 100 - percentile)}%</p>
              <p className="text-[9px] text-gray-400">faster than {percentile}%</p>
            </div>
          </div>

          {/* Action Sharing Buttons */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-white/20">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-orange-600 rounded-xl font-bold text-xs shadow-md hover:bg-orange-50 transition"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `CastNCart ${currentGameTitle} Puzzle`,
                    text: shareText,
                    url: window.location.href,
                  }).catch(() => handleCopy());
                } else {
                  handleCopy();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-xl font-bold text-xs shadow transition"
            >
              <Send className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Bottom Leaderboard Section */}
        <div className="p-5 bg-slate-50 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h4 className="font-extrabold text-gray-900 text-sm">
                Today's Leaderboard
              </h4>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Rank #{rank} of {totalPlayers} player{totalPlayers > 1 ? 's' : ''}
            </span>
          </div>

          {/* Leaderboard Table List */}
          <div className="space-y-2 mb-4">
            {topScores && topScores.length > 0 ? (
              topScores.slice(0, 5).map((entry, idx) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;
                const isMe = entry.isCurrentUser;

                return (
                  <div
                    key={entry.id || idx}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      isMe
                        ? 'bg-amber-100/70 border-amber-300 shadow-sm'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          isFirst
                            ? 'bg-amber-400 text-amber-950'
                            : isSecond
                            ? 'bg-slate-300 text-slate-900'
                            : isThird
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : entry.rank}
                      </div>

                      <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-300">
                        {entry.profilePhoto ? (
                          <img src={entry.profilePhoto} alt={entry.userName} className="w-full h-full object-cover" />
                        ) : (
                          entry.userName ? entry.userName[0].toUpperCase() : 'U'
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          {entry.userName || 'Player'}
                          {isMe && (
                            <span className="bg-primary text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              YOU
                            </span>
                          )}
                          {entry.role === 'Creator' && (
                            <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1 rounded flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" /> Teacher
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {entry.hintsUsed === 0 ? '✨ No hints' : `${entry.hintsUsed} hints`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">{formatTime(entry.timeTaken)}</p>
                      <p className="text-[9px] text-gray-400">time</p>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Fallback highlight current user if topScores empty */
              <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 font-black text-sm flex items-center justify-center shadow">
                    #{rank}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      {currentUser?.name || 'You'}
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {hintsUsed === 0 ? '🤓 No hints!' : `${hintsUsed} Hint${hintsUsed > 1 ? 's' : ''}`}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Top {Math.max(1, 100 - percentile)}% of players today
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-gray-900">{formatTime(timeTaken)}</p>
                  <p className="text-[10px] text-gray-400">Your time</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenLeaderboard) onOpenLeaderboard(gameId);
              }}
              className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              See full leaderboard
            </button>

            {onPlayNext && (
              <button
                onClick={onPlayNext}
                className="w-full py-2.5 px-4 bg-primary hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                Play next puzzle 🎮
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
