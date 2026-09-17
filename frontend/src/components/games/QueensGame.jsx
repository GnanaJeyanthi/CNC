import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, HelpCircle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Crown, X as XIcon, Sparkles } from 'lucide-react';
import { generateQueensPuzzle, getTodayDateStr } from '../../utils/gameGenerators';

export default function QueensGame({ onComplete, isCompletedToday = false, todayScore = null }) {
  const [puzzle, setPuzzle] = useState(null);
  const [gridState, setGridState] = useState([]); // null | 'cross' | 'queen'
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(true);
  const [isWon, setIsWon] = useState(false);
  const [conflicts, setConflicts] = useState(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    const p = generateQueensPuzzle(getTodayDateStr());
    setPuzzle(p);
    resetBoard(p);
  }, []);

  useEffect(() => {
    if (isRunning && !isWon) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, isWon]);

  const resetBoard = (p = puzzle) => {
    if (!p) return;
    const initial = Array(p.size).fill(null).map(() => Array(p.size).fill(null));
    setGridState(initial);
    setTimer(0);
    setIsRunning(false);
    setIsWon(false);
    setMoves(0);
    setHintsUsed(0);
    setHistory([]);
    setConflicts(new Set());
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Validate queens and find conflicts (Row, Column, Region, and 8-direction touching)
  const evaluateGrid = (currentGrid) => {
    if (!puzzle) return { conflictSet: new Set(), queenCount: 0, isValid: false };

    const size = puzzle.size;
    const conflictSet = new Set();
    const queens = [];

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (currentGrid[r][c] === 'queen') {
          queens.push({ r, c, region: puzzle.regionGrid[r][c] });
        }
      }
    }

    // Check row, col, region, and diagonal-touching conflicts
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];

        const sameRow = q1.r === q2.r;
        const sameCol = q1.c === q2.c;
        const sameRegion = q1.region === q2.region;
        const touchingDiagonal = Math.abs(q1.r - q2.r) <= 1 && Math.abs(q1.c - q2.c) <= 1;

        if (sameRow || sameCol || sameRegion || touchingDiagonal) {
          conflictSet.add(`${q1.r}-${q1.c}`);
          conflictSet.add(`${q2.r}-${q2.c}`);
        }
      }
    }

    const isValid = queens.length === size && conflictSet.size === 0;

    return { conflictSet, queenCount: queens.length, isValid };
  };

  // Handle cell click: Tap once -> 'cross' (X), Tap twice -> 'queen' (👑), Tap third -> clear
  const handleCellClick = (r, c, overrideVal = null) => {
    if (isWon || !puzzle) return;
    if (!isRunning) setIsRunning(true);

    const newGrid = gridState.map((row) => [...row]);
    const current = newGrid[r][c];
    
    let nextVal = overrideVal;
    if (nextVal === null) {
      if (current === null) nextVal = 'cross';
      else if (current === 'cross') nextVal = 'queen';
      else nextVal = null;
    }

    newGrid[r][c] = nextVal;
    setHistory((prev) => [...prev, gridState]);
    setGridState(newGrid);
    setMoves((m) => m + 1);

    const { conflictSet, isValid } = evaluateGrid(newGrid);
    setConflicts(conflictSet);

    if (isValid) {
      setIsWon(true);
      setIsRunning(false);
      if (onComplete) {
        onComplete({
          gameId: 'queens',
          timeTaken: Math.max(1, timer),
          moves: moves + 1,
          hintsUsed,
        });
      }
    }
  };

  // Right-click to quickly toggle cross
  const handleContextMenu = (e, r, c) => {
    e.preventDefault();
    if (isWon || !puzzle) return;
    if (!isRunning) setIsRunning(true);

    const current = gridState[r][c];
    handleCellClick(r, c, current === 'cross' ? null : 'cross');
  };

  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const previous = history[history.length - 1];
    setGridState(previous);
    setHistory((prev) => prev.slice(0, -1));
    const { conflictSet } = evaluateGrid(previous);
    setConflicts(conflictSet);
  };

  // Hint: places the next correct Queen or removes an invalid one
  const handleHint = () => {
    if (isWon || !puzzle) return;
    if (!isRunning) setIsRunning(true);
    setHintsUsed((h) => h + 1);

    const solution = puzzle.solution;
    const missing = solution.find((q) => gridState[q.r][q.c] !== 'queen');

    if (missing) {
      const newGrid = gridState.map((row) => [...row]);
      newGrid[missing.r][missing.c] = 'queen';
      setHistory((prev) => [...prev, gridState]);
      setGridState(newGrid);

      const { conflictSet, isValid } = evaluateGrid(newGrid);
      setConflicts(conflictSet);

      if (isValid) {
        setIsWon(true);
        setIsRunning(false);
        if (onComplete) {
          onComplete({
            gameId: 'queens',
            timeTaken: Math.max(1, timer),
            moves: moves + 1,
            hintsUsed: hintsUsed + 1,
          });
        }
      }
    }
  };

  const handleCheckSolution = () => {
    const { conflictSet, isValid, queenCount } = evaluateGrid(gridState);
    setConflicts(conflictSet);

    if (isValid) {
      setIsWon(true);
      setIsRunning(false);
      if (onComplete) {
        onComplete({
          gameId: 'queens',
          timeTaken: Math.max(1, timer),
          moves: moves + 1,
          hintsUsed,
        });
      }
    } else {
      if (conflictSet.size > 0) {
        alert('Some Queens are in conflict! Queens cannot share rows, columns, color regions, or touch diagonally.');
      } else {
        alert(`You need ${puzzle.size} Queens total. You currently have ${queenCount} placed.`);
      }
    }
  };

  if (!puzzle) return null;

  const queensCount = gridState.flat().filter((v) => v === 'queen').length;

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full">
      {/* Header Info */}
      <div className="w-full bg-white rounded-3xl p-5 shadow-sm border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg shadow-sm">
              👑
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                Queens <span className="text-xs text-gray-400 font-medium">#{puzzle.puzzleNumber}</span>
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Place {queensCount}/{puzzle.size} Queens
              </p>
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

      {/* Vibrant LinkedIn-style Queens Grid with Bold Region Outlines */}
      <div className="relative bg-black p-1 rounded-2xl shadow-2xl border-4 border-black w-full aspect-square flex items-center justify-center select-none touch-none overflow-hidden">
        <div
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            gap: '0px',
          }}
        >
          {Array(puzzle.size).fill(0).map((_, r) =>
            Array(puzzle.size).fill(0).map((_, c) => {
              const regionIdx = puzzle.regionGrid[r][c];
              const regionColor = puzzle.regionColors[regionIdx];
              const cellVal = gridState[r]?.[c];
              const isConflict = conflicts.has(`${r}-${c}`);

              // Calculate thick boundary borders between distinct color zones (exact LinkedIn style)
              const borderTop = r === 0 || puzzle.regionGrid[r - 1][c] !== regionIdx ? '2.5px solid #111827' : '1px solid rgba(0, 0, 0, 0.12)';
              const borderBottom = r === puzzle.size - 1 || puzzle.regionGrid[r + 1][c] !== regionIdx ? '2.5px solid #111827' : '1px solid rgba(0, 0, 0, 0.12)';
              const borderLeft = c === 0 || puzzle.regionGrid[r][c - 1] !== regionIdx ? '2.5px solid #111827' : '1px solid rgba(0, 0, 0, 0.12)';
              const borderRight = c === puzzle.size - 1 || puzzle.regionGrid[r][c + 1] !== regionIdx ? '2.5px solid #111827' : '1px solid rgba(0, 0, 0, 0.12)';

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleContextMenu(e, r, c)}
                  style={{
                    backgroundColor: regionColor,
                    borderTop,
                    borderBottom,
                    borderLeft,
                    borderRight,
                  }}
                  className={`relative flex items-center justify-center cursor-pointer transition-all duration-100 ${
                    isConflict
                      ? 'ring-4 ring-red-500 z-10 animate-pulse'
                      : 'hover:brightness-95'
                  }`}
                >
                  {/* Golden Queen Crown (Exact visual styling matching LinkedIn image 2) */}
                  {cellVal === 'queen' && (
                    <div className="text-amber-800 flex items-center justify-center transform transition-transform hover:scale-110 drop-shadow-sm">
                      <Crown className="w-6 h-6 fill-amber-500 stroke-amber-800 stroke-[1.5]" />
                    </div>
                  )}

                  {/* Marker X */}
                  {cellVal === 'cross' && (
                    <XIcon className="w-4 h-4 text-gray-800/60 stroke-[3]" />
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
          queensCount === puzzle.size
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white scale-[1.02] animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        <Crown className="w-4 h-4 text-amber-300" />
        {isWon ? 'See Results 🎉' : queensCount === puzzle.size ? 'Submit Queens Solution 🎉' : 'Check Solution'}
      </button>

      {/* Action Controls */}
      <div className="w-full flex items-center gap-3 mt-3">
        <button
          onClick={handleUndo}
          disabled={history.length === 0 || isWon}
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

      {/* How to Play Accordion (Formatted exactly to match image 2) */}
      <div className="w-full mt-4 bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <button
          onClick={() => setShowHowToPlay(!showHowToPlay)}
          className="w-full p-4 flex items-center justify-between text-left text-sm font-bold text-gray-900 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <span>How to play</span>
          </div>
          {showHowToPlay ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showHowToPlay && (
          <div className="p-4 pt-0 text-xs text-gray-700 space-y-2.5 border-t border-gray-100 bg-white leading-relaxed">
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-gray-900">1.</span>
              <span>
                Your goal is to have <strong>exactly one 👑 in each row, column, and color region</strong>.
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-gray-900">2.</span>
              <span>
                Tap once to place <strong>X</strong> and tap twice for <strong>👑</strong>. Use X to mark where 👑 cannot be placed.
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="font-bold text-gray-900">3.</span>
              <span>
                Two 👑 <strong>cannot touch each other, not even diagonally</strong>.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
