import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, HelpCircle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Play, Sparkles } from 'lucide-react';
import { generateZipPuzzle, getTodayDateStr } from '../../utils/gameGenerators';

export default function ZipGame({ onComplete, isCompletedToday = false, todayScore = null }) {
  const [puzzle, setPuzzle] = useState(null);
  const [path, setPath] = useState([]); // Array of { r, c }
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const timerRef = useRef(null);

  // Initialize or reset puzzle
  useEffect(() => {
    const p = generateZipPuzzle(getTodayDateStr());
    setPuzzle(p);
    resetBoard(p);
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isWon) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isWon]);

  const resetBoard = (p = puzzle) => {
    if (!p) return;
    const startNode = p.checkpoints[0];
    setPath([{ r: startNode.r, c: startNode.c }]);
    setCurrentCheckpointIndex(1);
    setTimer(0);
    setIsRunning(false);
    setIsWon(false);
    setMoves(0);
    setHintsUsed(0);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Check if cell is in current path
  const getPathIndex = (r, c) => {
    return path.findIndex((p) => p.r === r && p.c === c);
  };

  // Check if cell has checkpoint
  const getCheckpoint = (r, c) => {
    if (!puzzle) return null;
    return puzzle.checkpoints.find((cp) => cp.r === r && cp.c === c);
  };

  // Handle cell click / step
  const handleCellClick = (r, c) => {
    if (isWon || !puzzle) return;
    if (!isRunning) setIsRunning(true);

    const lastStep = path[path.length - 1];
    const existingIndex = getPathIndex(r, c);

    // If clicking on previous cell, treat as undo
    if (existingIndex !== -1 && existingIndex === path.length - 2) {
      const newPath = path.slice(0, -1);
      setPath(newPath);
      setMoves((m) => m + 1);

      // Recalculate current checkpoint index
      let nextCp = 1;
      for (const cp of puzzle.checkpoints) {
        const inPath = newPath.some((pt) => pt.r === cp.r && pt.c === cp.c);
        if (inPath && cp.num > nextCp) {
          nextCp = cp.num;
        }
      }
      setCurrentCheckpointIndex(nextCp);
      return;
    }

    // Check if cell is adjacent to lastStep (Manhattan distance == 1)
    const isAdjacent = Math.abs(lastStep.r - r) + Math.abs(lastStep.c - c) === 1;
    if (!isAdjacent) return;

    // Check if cell is already visited
    if (existingIndex !== -1) return;

    // Check checkpoint ordering rule: cannot hit checkpoint out of order
    const cp = getCheckpoint(r, c);
    const expectedNextCheckpoint = currentCheckpointIndex + 1;

    if (cp && cp.num !== expectedNextCheckpoint) {
      // Trying to hit higher checkpoint prematurely
      return;
    }

    const nextPath = [...path, { r, c }];
    setPath(nextPath);
    setMoves((m) => m + 1);

    let nextCpNum = currentCheckpointIndex;
    if (cp && cp.num === expectedNextCheckpoint) {
      nextCpNum = cp.num;
      setCurrentCheckpointIndex(nextCpNum);
    }

    // Check Win Condition: reached last checkpoint and traversed correctly
    if (nextCpNum === puzzle.maxCheckpoint) {
      setIsWon(true);
      setIsRunning(false);
      if (onComplete) {
        onComplete({
          gameId: 'zip',
          timeTaken: Math.max(1, timer),
          moves: moves + 1,
          hintsUsed,
        });
      }
    }
  };

  // Undo step
  const handleUndo = () => {
    if (path.length <= 1 || isWon) return;
    const newPath = path.slice(0, -1);
    setPath(newPath);
    
    // Recalculate checkpoint index
    let nextCp = 1;
    if (puzzle) {
      for (const cp of puzzle.checkpoints) {
        const inPath = newPath.some((pt) => pt.r === cp.r && pt.c === cp.c);
        if (inPath && cp.num > nextCp) {
          nextCp = cp.num;
        }
      }
    }
    setCurrentCheckpointIndex(nextCp);
  };

  // Hint step (advances 1 step along correct solution path)
  const handleHint = () => {
    if (isWon || !puzzle) return;
    if (!isRunning) setIsRunning(true);
    setHintsUsed((h) => h + 1);

    const solutionPath = puzzle.path;
    const currentLen = path.length;

    if (currentLen < solutionPath.length) {
      const nextCell = solutionPath[currentLen];
      handleCellClick(nextCell.r, nextCell.c);
    }
  };

  const handleCheckSolution = () => {
    if (currentCheckpointIndex === puzzle.maxCheckpoint) {
      setIsWon(true);
      setIsRunning(false);
      if (onComplete) {
        onComplete({
          gameId: 'zip',
          timeTaken: Math.max(1, timer),
          moves: moves + 1,
          hintsUsed,
        });
      }
    } else {
      alert(`Connect through all checkpoints in order! Next checkpoint is #${currentCheckpointIndex + 1}.`);
    }
  };

  if (!puzzle) return null;

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full">
      {/* Top Header Card */}
      <div className="w-full bg-white rounded-3xl p-5 shadow-sm border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">
              🌀
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                Zip <span className="text-xs text-gray-400 font-medium">#{puzzle.puzzleNumber}</span>
              </h3>
              <p className="text-[11px] text-gray-500">Connect 1 to {puzzle.maxCheckpoint} in order</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-100 px-3 py-1.5 rounded-xl font-mono font-bold text-gray-800 text-sm">
              ⏱️ {formatTime(timer)}
            </div>
            {isCompletedToday && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Solved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Zip Game Board */}
      <div className="relative bg-white p-4 rounded-3xl shadow-md border border-border w-full aspect-square flex items-center justify-center select-none touch-none">
        <div
          className="grid gap-2 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          }}
        >
          {Array(puzzle.size).fill(0).map((_, r) =>
            Array(puzzle.size).fill(0).map((_, c) => {
              const cp = getCheckpoint(r, c);
              const pathIdx = getPathIndex(r, c);
              const isInPath = pathIdx !== -1;
              const isHead = isInPath && pathIdx === path.length - 1;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 border ${
                    isInPath
                      ? 'bg-emerald-500 border-emerald-600 text-white shadow-md'
                      : 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100/70'
                  }`}
                >
                  {/* Numbered Checkpoint Marker (Black Circle with White Number, like screenshot) */}
                  {cp && (
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-md transition-transform ${
                        isInPath
                          ? 'bg-black text-white ring-2 ring-emerald-300 scale-105'
                          : 'bg-black text-white'
                      }`}
                    >
                      {cp.num}
                    </div>
                  )}

                  {/* Pulsing indicator for active head of trail */}
                  {isHead && !isWon && (
                    <span className="absolute w-3 h-3 rounded-full bg-white shadow-lg animate-ping pointer-events-none" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Primary Submit Button */}
      <button
        onClick={handleCheckSolution}
        className={`w-full mt-4 py-3 px-6 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
          currentCheckpointIndex === puzzle.maxCheckpoint
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white scale-[1.02] animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        <Sparkles className="w-4 h-4 text-emerald-300" />
        {isWon ? 'See Results 🎉' : currentCheckpointIndex === puzzle.maxCheckpoint ? 'Submit Zip Solution 🎉' : 'Check Solution'}
      </button>

      {/* Game Action Controls */}
      <div className="w-full flex items-center gap-3 mt-3">
        <button
          onClick={handleUndo}
          disabled={path.length <= 1 || isWon}
          className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-bold text-sm text-gray-700 shadow-sm transition flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
          Undo
        </button>

        <button
          onClick={handleHint}
          disabled={isWon}
          className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-bold text-sm text-amber-700 shadow-sm transition flex items-center justify-center gap-2"
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Hint
        </button>

        <button
          onClick={() => resetBoard()}
          className="py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl font-bold text-sm text-gray-500 shadow-sm transition flex items-center justify-center"
          title="Restart Puzzle"
        >
          Reset
        </button>
      </div>

      {/* How to Play Accordion */}
      <div className="w-full mt-4 bg-white rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowHowToPlay(!showHowToPlay)}
          className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>How to play Zip</span>
          </div>
          {showHowToPlay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHowToPlay && (
          <div className="p-4 pt-1 text-xs text-gray-600 space-y-2 border-t border-gray-100 bg-slate-50/50">
            <p>1. Start at <strong>1</strong> and click adjacent tiles (up, down, left, right) to draw a continuous path.</p>
            <p>2. Connect the checkpoints in numerical order: <strong>1 → 2 → 3 ... → {puzzle.maxCheckpoint}</strong>.</p>
            <p>3. Do not cross or revisit already visited tiles.</p>
            <p>4. Reach the final number to complete the puzzle and record your score on the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
}
