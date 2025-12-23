export interface CrosswordClue {
  number: number
  direction: 'across' | 'down'
  clue: string
  answer: string
  row: number
  col: number
}

export interface CrosswordPuzzle {
  width: number
  height: number
  clues: CrosswordClue[]
  theme: string
}

// Helper to create grid from clues
export function createGrid(puzzle: CrosswordPuzzle): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: puzzle.height }, () =>
    Array(puzzle.width).fill(null)
  )

  for (const clue of puzzle.clues) {
    const { answer, row, col, direction } = clue
    for (let i = 0; i < answer.length; i++) {
      const r = direction === 'down' ? row + i : row
      const c = direction === 'across' ? col + i : col
      grid[r][c] = '' // Empty string means cell is playable
    }
  }

  return grid
}

// Get answer grid for validation
export function getAnswerGrid(puzzle: CrosswordPuzzle): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: puzzle.height }, () =>
    Array(puzzle.width).fill(null)
  )

  for (const clue of puzzle.clues) {
    const { answer, row, col, direction } = clue
    for (let i = 0; i < answer.length; i++) {
      const r = direction === 'down' ? row + i : row
      const c = direction === 'across' ? col + i : col
      grid[r][c] = answer[i]
    }
  }

  return grid
}

// Get clue numbers for each cell
export function getClueNumbers(puzzle: CrosswordPuzzle): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: puzzle.height }, () =>
    Array(puzzle.width).fill(null)
  )

  for (const clue of puzzle.clues) {
    grid[clue.row][clue.col] = clue.number
  }

  return grid
}

export const crosswordPuzzles: CrosswordPuzzle[] = [
  // Puzzle 1: Photography theme
  // All letter sequences form valid words, properly spaced with black squares
  // Grid layout:
  //   0 1 2 3 4 5 6 7
  // 0 . . . . . . . .
  // 1 F L A S H . . .
  // 2 . E . N . . . .
  // 3 . N . A . Z . .
  // 4 . S . P H O T O
  // 5 . . . . . O . .
  // 6 . . . . . M . .
  {
    width: 8,
    height: 7,
    theme: 'Photography',
    clues: [
      { number: 1, direction: 'across', clue: 'Sudden burst of light', answer: 'FLASH', row: 1, col: 0 },
      { number: 2, direction: 'down', clue: 'Camera glass', answer: 'LENS', row: 1, col: 1 },
      { number: 3, direction: 'down', clue: 'Quick picture', answer: 'SNAP', row: 1, col: 3 },
      { number: 4, direction: 'down', clue: 'Magnify the view', answer: 'ZOOM', row: 3, col: 5 },
      { number: 5, direction: 'across', clue: 'Camera capture', answer: 'PHOTO', row: 4, col: 3 },
    ],
  },
  // Puzzle 2: Games theme
  // All letter sequences form valid words
  // Grid layout:
  //   0 1 2 3 4 5 6 7
  // 0 D I C E . . . .
  // 1 . . A . . . . .
  // 2 . . R E P . . .
  // 3 . . D . A . . .
  // 4 . . . . W I N S
  // 5 . . . . N . . .
  {
    width: 8,
    height: 6,
    theme: 'Games',
    clues: [
      { number: 1, direction: 'across', clue: 'Roll these to play', answer: 'DICE', row: 0, col: 0 },
      { number: 2, direction: 'down', clue: 'Playing ___', answer: 'CARD', row: 0, col: 2 },
      { number: 3, direction: 'across', clue: 'Reputation, for short', answer: 'REP', row: 2, col: 2 },
      { number: 4, direction: 'down', clue: 'Chess piece', answer: 'PAWN', row: 2, col: 4 },
      { number: 5, direction: 'across', clue: 'Game victories', answer: 'WINS', row: 4, col: 4 },
    ],
  },
]
