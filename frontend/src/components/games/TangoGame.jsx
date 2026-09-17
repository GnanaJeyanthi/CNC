import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, HelpCircle, Lightbulb, CheckCircle2, ChevronDown, ChevronUp, Sun, Moon, Sparkles } from 'lucide-react';
import { generateTangoPuzzle, getTodayDateStr } from '../../utils/gameGenerators';

export default function TangoGame({ onComplete, isCompletedToday = false, todayScore = null }) {
  const [puzzle, setPuzzle] = useState(null);
  const [gridState, setGridState] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [conflicts, setConflicts] = useState(new Set());
  const timerRef = useRef(null);

  useEffect(() => {
    const p = generateTangoPuzzle(getTodayDateStr());
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
    const initial = p.initialGrid.map((row) => [...row]);
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

  const evaluateGrid = (currentGrid) => {
    if (!puzzle) return { conflictSet: new Set(), isValid: false };
    const size = puzzle.size;
    const targetPerSymbol = size / 2;
    const conflictSet = new Set();

    // 1. Check Row Counts & Triples
    for (let r = 0; r < size; r++) {
      let sCount = 0;
      let mCount = 0;
      for (let c = 0; c < size; c++) {
        const val = currentGrid[r][c];
        if (val === 'S') sCount++;
        if (val === 'M') mCount++;
        // Check 3 consecutive
        if (c >= 2) {
          const v0 = currentGrid[r][c - 2];
          const v1 = currentGrid[r][c - 1];
          const v2 = currentGrid[r][c];
          if (v0 && v0 === v1 && v1 === v2) {
            conflictSet.add(`${r}-${c - 2}`);
            conflictSet.add(`${r}-${c - 1}`);
            conflictSet.add(`${r}-${c}`);
          }
        }
      }
      if (sCount > targetPerSymbol || mCount > targetPerSymbol) {
        for (let c = 0; c < size; c++) conflictSet.add(`${r}-${c}`);
      }
    }

    // 2. Check Col Counts & Triples
    for (let c = 0; c < size; c++) {
      let sCount = 0;
      let mCount = 0;
      for (let r = 0; r < size; r++) {
        const val = currentGrid[r][c];
        if (val === 'S') sCount++;
        if (val === 'M') mCount++;
        // Check 3 consecutive
        if (r >= 2) {
          const v0 = currentGrid[r - 2][c];
          const v1 = currentGrid[r - 1][c];
          const v2 = currentGrid[r][c];
          if (v0 && v0 === v1 && v1 === v2) {
            conflictSet.add(`${r - 2}-${c}`);
            conflictSet.add(`${r - 1}-${c}`);
            conflictSet.add(`${r}-${c}`);
          }
        }
      }
      if (sCount > targetPerSymbol || mCount > targetPerSymbol) {
        for (let r = 0; r < size; r++) conflictSet.add(`${r}-${c}`);
      }
    }

    // 3. Check Horizontal Clues
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size - 1; c++) {
        const clue = puzzle.hRelations[r][c];
        const v1 = currentGrid[r][c];
        const v2 = currentGrid[r][c + 1];
        if (clue && v1 && v2) {
          if (clue === '=' && v1 !== v2) {
            conflictSet.add(`${r}-${c}`);
            conflictSet.add(`${r}-${c + 1}`);
          }
          if (clue === 'x' && v1 === v2) {
            conflictSet.add(`${r}-${c}`);
            conflictSet.add(`${r}-${c + 1}`);
          }
        }
      }
    }

    // 4. Check Vertical Clues
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size; c++) {
        const clue = puzzle.vRelations[r][c];
        const v1 = currentGrid[r][c];
        const v2 = currentGrid[r + 1][c];
        if (clue && v1 && v2) {
          if (clue === '=' && v1 !== v2) {
            conflictSet.add(`${r}-${c}`);
            conflictSet.add(`${r + 1}-${c}`);
          }
          if (clue === 'x' && v1 === v2) {
            conflictSet.add(`${r}-${c}`);
            conflictSet.add(`${r + 1}-${c}`);
          }
        }
      }
    }

    // Fully filled check
    const isFull = currentGrid.every((row) => row.every((val) => val === 'S' || val === 'M'));
    const isValid = isFull && conflictSet.size === 0;

    return { conflictSet, isValid };
  };

  const handleCellClick = (r, c) => {
    if (isWon || !puzzle) return;
    // Don't modify initial pre-filled clues
    if (puzzle.initialGrid[r][c]) return;

    if (!isRunning) setIsRunning(true);

    const newGrid = gridState.map((row) => [...row]);
    const current = newGrid[r][c];

    // Cycle: null -> 'S' (Sun) -> 'M' (Moon) -> null
    let nextVal = null;
    if (current === null) nextVal = 'S';
    else if (current === 'S') nextVal = 'M';
    else nextVal = null;

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
          gameId: 'tango',
          timeTaken: Math.max(1, timer),
          moves: moves + 1,
          hintsUsed,
        });
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const previous = history[history.length - 1];
    setGridState(previous);
    setHistory((prev) => prev.slice(0, -1));
    const { conflictSet } = evaluateGrid(previous);
    setConflicts(conflictSet);
  };

  const handleHint = () => {
    if (isWon || !puzzle) return;
    if (!isRunning) setIsRunning(true);
    setHintsUsed((h) => h + 1);

    // Find first cell differing from solution
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (!puzzle.initialGrid[r][c] && gridState[r][c] !== puzzle.solution[r][c]) {
          const newGrid = gridState.map((row) => [...row]);
          newGrid[r][c] = puzzle.solution[r][c];
          setHistory((prev) => [...prev, gridState]);
          setGridState(newGrid);

          const { conflictSet, isValid } = evaluateGrid(newGrid);
          setConflicts(conflictSet);

          if (isValid) {
            setIsWon(true);
            setIsRunning(false);
            if (onComplete) {
              onComplete({
                gameId: 'tango',
                timeTaken: Math.max(1, timer),
                moves: moves + 1,
                hintsUsed: hintsUsed + 1,
              });
            }
          }
          return;
        }
      }
    }
  };

  const handleCheckSolution = () => {
    const { conflictSet, isValid } = evaluateGrid(gridState);
    setConflicts(conflictSet);

    if (isValid) {
      setIsWon(true);
      setIsRunning(false);
      if (onComplete) {
        onComplete({
          gameId: 'tango',
          timeTaken: Math.max(1, timer),
          moves: moves + 1,
          hintsUsed,
        });
      }
    } else {
      if (conflictSet.size > 0) {
        alert('Some cells have conflicts! Look for the red highlighted tiles to fix them.');
      } else {
        alert('Almost there! Please fill all empty tiles with Suns ☀️ or Moons 🌙.');
      }
    }
  };

  const isBoardFull = gridState.length > 0 && gridState.every((row) => row.every((val) => val === 'S' || val === 'M'));

  if (!puzzle) return null;

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full">
      {/* Header Info */}
      <div className="w-full bg-white rounded-3xl p-5 shadow-sm border border-border mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg">
              ☀️
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                Tango <span className="text-xs text-gray-400 font-medium">#{puzzle.puzzleNumber}</span>
              </h3>
              <p className="text-[11px] text-gray-500">Balance Suns ☀️ and Moons 🌙</p>
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

      {/* Interactive Tango Board */}
      <div className="relative bg-slate-100 p-3 rounded-3xl shadow-md border border-gray-200 w-full aspect-square flex items-center justify-center select-none touch-none">
        <div
          className="grid gap-2 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${puzzle.size}, minmax(0, 1fr))`,
          }}
        >
          {Array(puzzle.size).fill(0).map((_, r) =>
            Array(puzzle.size).fill(0).map((_, c) => {
              const val = gridState[r]?.[c];
              const isPre = !!puzzle.initialGrid[r][c];
              const isConflict = conflicts.has(`${r}-${c}`);
              const hClue = puzzle.hRelations[r]?.[c];
              const vClue = puzzle.vRelations[r]?.[c];

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative rounded-2xl flex items-center justify-center font-bold text-xl cursor-pointer transition-all duration-200 border ${
                    isConflict
                      ? 'bg-red-50 border-red-400 ring-2 ring-red-400'
                      : isPre
                      ? 'bg-slate-200 border-slate-300 text-gray-800 cursor-default shadow-inner'
                      : val
                      ? 'bg-white border-gray-300 shadow-sm'
                      : 'bg-white/80 border-dashed border-gray-300 hover:bg-white'
                  }`}
                >
                  {val === 'S' && (
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-md animate-scale-up">
                      <Sun className="w-5 h-5 fill-amber-100 stroke-amber-600" />
                    </div>
                  )}

                  {val === 'M' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md animate-scale-up">
                      <Moon className="w-5 h-5 fill-indigo-200 stroke-indigo-400" />
                    </div>
                  )}

                  {/* Horizontal Clue Operator badge */}
                  {hClue && (
                    <span className="absolute -right-2.5 z-10 w-4 h-4 bg-gray-900 text-white rounded-full text-[10px] font-black flex items-center justify-center pointer-events-none shadow">
                      {hClue}
                    </span>
                  )}

                  {/* Vertical Clue Operator badge */}
                  {vClue && (
                    <span className="absolute -bottom-2.5 z-10 w-4 h-4 bg-gray-900 text-white rounded-full text-[10px] font-black flex items-center justify-center pointer-events-none shadow">
                      {vClue}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Primary Submit Button when completed or in progress */}
      <button
        onClick={handleCheckSolution}
        className={`w-full mt-4 py-3 px-6 rounded-2xl font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
          isBoardFull
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white scale-[1.02] animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-white'
        }`}
      >
        <Sparkles className="w-4 h-4 text-amber-300" />
        {isWon ? 'See Results 🎉' : isBoardFull ? 'Submit Tango Solution 🎉' : 'Check Solution'}
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

      {/* How to Play Accordion */}
      <div className="w-full mt-4 bg-white rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowHowToPlay(!showHowToPlay)}
          className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>How to play Tango</span>
          </div>
          {showHowToPlay ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showHowToPlay && (
          <div className="p-4 pt-1 text-xs text-gray-600 space-y-2 border-t border-gray-100 bg-slate-50/50">
            <p>1. Fill the grid with <strong>Suns ☀️</strong> and <strong>Moons 🌙</strong>.</p>
            <p>2. Each row and column must contain an <strong>equal number</strong> of Suns and Moons (3 of each).</p>
            <p>3. No more than two of the same symbol can appear side-by-side (no 3 Suns or 3 Moons in a line).</p>
            <p>4. <strong>=</strong> clues mean adjacent cells are the same; <strong>x</strong> clues mean they are opposites.</p>
          </div>
        )}
      </div>
    </div>
  );
}
