// Deterministic PRNG using Mulberry32 based on date seed string
export function createRNG(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let seed = h >>> 0;

  return function() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Get standard date string YYYY-MM-DD
export function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Puzzle Issue Number calculator
export function getPuzzleNumber(gameId, dateStr = getTodayDateStr()) {
  const baseDate = new Date('2025-01-01');
  const targetDate = new Date(dateStr);
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const offsets = { zip: 534, queens: 855, tango: 695 };
  return (offsets[gameId] || 100) + Math.max(0, diffDays);
}

/* =========================================================================
   1. ZIP GAME GENERATOR
   Connect numbered checkpoints in order 1 -> 2 -> ... -> N along a valid path
   ========================================================================= */
export function generateZipPuzzle(dateStr = getTodayDateStr(), size = 6) {
  const rng = createRNG(`zip-${dateStr}-${size}`);
  const totalCells = size * size;

  // Generate a snake / maze path traversing cells
  // Using a self-avoiding random walk with back-up or pre-baked procedural templates
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  
  // Curated procedural path patterns based on daily seed
  const path = [];
  const visited = Array(size).fill(null).map(() => Array(size).fill(false));

  let r = 0, c = 0;
  path.push({ r, c });
  visited[r][c] = true;

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: 0 }
  ];

  // Build a winding path of length 16 to 24
  const targetPathLength = 16 + Math.floor(rng() * 6); // 16 to 21 steps
  
  for (let step = 1; step < targetPathLength; step++) {
    // Shuffle directions
    const dirs = [...directions].sort(() => rng() - 0.5);
    let moved = false;

    for (const { dr, dc } of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
        r = nr;
        c = nc;
        visited[r][c] = true;
        path.push({ r, c });
        moved = true;
        break;
      }
    }

    if (!moved) break;
  }

  // Pick 6-8 key checkpoint numbers along the path
  const numCheckpoints = Math.min(8, Math.max(5, Math.floor(path.length / 2.5)));
  const checkpoints = [];
  
  // Step 1 is always path[0]
  checkpoints.push({ num: 1, r: path[0].r, c: path[0].c, pathIndex: 0 });

  const stepGap = (path.length - 1) / (numCheckpoints - 1);
  for (let i = 1; i < numCheckpoints - 1; i++) {
    const idx = Math.round(i * stepGap);
    checkpoints.push({ num: i + 1, r: path[idx].r, c: path[idx].c, pathIndex: idx });
  }
  // Last checkpoint
  const lastIdx = path.length - 1;
  checkpoints.push({ num: numCheckpoints, r: path[lastIdx].r, c: path[lastIdx].c, pathIndex: lastIdx });

  return {
    gameId: 'zip',
    date: dateStr,
    puzzleNumber: getPuzzleNumber('zip', dateStr),
    size,
    path,
    checkpoints,
    maxCheckpoint: numCheckpoints,
  };
}

/* =========================================================================
   2. QUEENS GAME GENERATOR (LinkedIn Queens)
   Place 1 Queen per row, 1 per col, 1 per color region with no two touching (incl diagonals)
   ========================================================================= */
export function generateQueensPuzzle(dateStr = getTodayDateStr(), size = 7) {
  const rng = createRNG(`queens-${dateStr}-${size}`);

  // 1. Generate valid N-Queens non-attacking (including diagonal non-adjacent) solution
  // For Queens puzzle, no two queens can be in same row, col, or adjacent in 8-directions
  let solution = null;
  let attempts = 0;

  while (!solution && attempts < 200) {
    attempts++;
    const cols = Array.from({ length: size }, (_, i) => i).sort(() => rng() - 0.5);
    let valid = true;

    for (let r1 = 0; r1 < size; r1++) {
      for (let r2 = r1 + 1; r2 < size; r2++) {
        const c1 = cols[r1];
        const c2 = cols[r2];
        // Check if adjacent in 8 directions (touching)
        if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) {
          valid = false;
          break;
        }
      }
      if (!valid) break;
    }

    if (valid) {
      solution = cols.map((c, r) => ({ r, c }));
    }
  }

  // Fallback preset solution for size 7 if random walk takes too long
  if (!solution) {
    const presets = [
      [1, 3, 5, 0, 2, 4, 6],
      [0, 2, 4, 6, 1, 3, 5],
      [1, 4, 0, 3, 6, 2, 5],
      [2, 5, 1, 4, 0, 3, 6]
    ];
    const picked = presets[Math.floor(rng() * presets.length)];
    solution = picked.map((c, r) => ({ r, c }));
  }

  // 2. Generate N contiguous color regions such that each region has exactly ONE Queen
  const regionGrid = Array(size).fill(null).map(() => Array(size).fill(-1));
  const regionColors = [
    '#B49AE4', // Rich Lavender / Purple (like image 2)
    '#FFC085', // Warm Peach / Orange (like image 2)
    '#FF7B69', // Vibrant Coral / Salmon Red (like image 2)
    '#82B5FF', // Vibrant Sky Blue (like image 2)
    '#DCF685', // Lime / Yellow-Green (like image 2)
    '#9AE5A8', // Fresh Mint Green (like image 2)
    '#D7DCE2', // Silver / Light Slate (like image 2)
    '#FFDA6E', // Warm Golden Yellow
  ];

  // Assign initial queen positions to distinct regions 0..size-1
  solution.forEach((q, idx) => {
    regionGrid[q.r][q.c] = idx;
  });

  // Flood fill remaining cells randomly to adjacent assigned regions
  let unassigned = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (regionGrid[r][c] === -1) unassigned.push({ r, c });
    }
  }

  while (unassigned.length > 0) {
    let filledAny = false;
    unassigned = unassigned.filter(({ r, c }) => {
      const neighbors = [
        { nr: r - 1, nc: c },
        { nr: r + 1, nc: c },
        { nr: r, nc: c - 1 },
        { nr: r, nc: c + 1 },
      ].filter(n => n.nr >= 0 && n.nr < size && n.nc >= 0 && n.nc < size && regionGrid[n.nr][n.nc] !== -1);

      if (neighbors.length > 0) {
        const chosen = neighbors[Math.floor(rng() * neighbors.length)];
        regionGrid[r][c] = regionGrid[chosen.nr][chosen.nc];
        filledAny = true;
        return false; // Remove from unassigned
      }
      return true; // Keep in unassigned
    });

    if (!filledAny && unassigned.length > 0) {
      // Force assign first unassigned to region 0
      const first = unassigned.shift();
      regionGrid[first.r][first.c] = 0;
    }
  }

  return {
    gameId: 'queens',
    date: dateStr,
    puzzleNumber: getPuzzleNumber('queens', dateStr),
    size,
    regionGrid,
    regionColors: regionColors.slice(0, size),
    solution,
  };
}

/* =========================================================================
   3. TANGO GAME GENERATOR (LinkedIn Tango)
   Sun ☀️ (S) and Moon 🌙 (M) grid logic puzzle
   - Equal S & M per row & column (3 of each in 6x6)
   - No 3 consecutive same symbols
   - Clues '=' (same) and 'x' (opposite)
   ========================================================================= */
export function generateTangoPuzzle(dateStr = getTodayDateStr(), size = 6) {
  const rng = createRNG(`tango-${dateStr}-${size}`);
  
  // Valid solved 6x6 binary grids
  const baseGrids = [
    [
      ['S', 'M', 'S', 'M', 'M', 'S'],
      ['M', 'S', 'M', 'S', 'S', 'M'],
      ['S', 'S', 'M', 'M', 'S', 'M'],
      ['M', 'M', 'S', 'S', 'M', 'S'],
      ['S', 'M', 'M', 'S', 'M', 'S'],
      ['M', 'S', 'S', 'M', 'S', 'M'],
    ],
    [
      ['M', 'S', 'S', 'M', 'S', 'M'],
      ['S', 'M', 'M', 'S', 'M', 'S'],
      ['M', 'S', 'M', 'S', 'S', 'M'],
      ['S', 'M', 'S', 'M', 'M', 'S'],
      ['M', 'M', 'S', 'S', 'M', 'S'],
      ['S', 'S', 'M', 'M', 'S', 'M'],
    ],
    [
      ['S', 'S', 'M', 'M', 'S', 'M'],
      ['M', 'M', 'S', 'S', 'M', 'S'],
      ['S', 'M', 'S', 'M', 'M', 'S'],
      ['M', 'S', 'M', 'S', 'S', 'M'],
      ['S', 'M', 'M', 'S', 'S', 'M'],
      ['M', 'S', 'S', 'M', 'M', 'S'],
    ]
  ];

  const pickedIndex = Math.floor(rng() * baseGrids.length);
  const solution = baseGrids[pickedIndex];

  // Generate pre-filled cells (around 4-6 starting symbols)
  const initialGrid = Array(size).fill(null).map(() => Array(size).fill(null));
  let prefillCount = 5 + Math.floor(rng() * 2);

  while (prefillCount > 0) {
    const r = Math.floor(rng() * size);
    const c = Math.floor(rng() * size);
    if (!initialGrid[r][c]) {
      initialGrid[r][c] = solution[r][c];
      prefillCount--;
    }
  }

  // Generate relationship clues: '=' (same) and 'x' (opposite)
  // Horizontal relations between (r, c) and (r, c+1)
  const hRelations = Array(size).fill(null).map(() => Array(size - 1).fill(null));
  // Vertical relations between (r, c) and (r+1, c)
  const vRelations = Array(size - 1).fill(null).map(() => Array(size).fill(null));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      if (rng() < 0.35) {
        hRelations[r][c] = solution[r][c] === solution[r][c + 1] ? '=' : 'x';
      }
    }
  }

  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      if (rng() < 0.35) {
        vRelations[r][c] = solution[r][c] === solution[r + 1][c] ? '=' : 'x';
      }
    }
  }

  return {
    gameId: 'tango',
    date: dateStr,
    puzzleNumber: getPuzzleNumber('tango', dateStr),
    size,
    initialGrid,
    hRelations,
    vRelations,
    solution,
  };
}
