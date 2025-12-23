export type GameType = 'findWords' | 'crossword' | 'rearrange'

export interface RoundState {
  completed: boolean
  foundWords?: string[] // For findWords and rearrange
  answers?: Record<string, string> // For crossword
}

export interface GameState {
  findWords: RoundState[]
  crossword: RoundState[]
  rearrange: RoundState[]
  currentView: 'intro' | 'menu' | 'game' | 'victory'
  currentGame: GameType | null
  currentRound: number
  seenIntro: boolean
}

const STORAGE_KEY = 'martyna-puzzle-progress'

const ROUND_COUNTS: Record<GameType, number> = {
  findWords: 3,
  crossword: 2,
  rearrange: 5,
}

function createInitialState(): GameState {
  return {
    findWords: Array.from({ length: 3 }, () => ({ completed: false })),
    crossword: Array.from({ length: 2 }, () => ({ completed: false })),
    rearrange: Array.from({ length: 5 }, () => ({ completed: false })),
    currentView: 'intro',
    currentGame: null,
    currentRound: 0,
    seenIntro: false,
  }
}

export function loadState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GameState>
      const initial = createInitialState()
      return {
        ...initial,
        ...parsed,
        currentView: parsed.seenIntro ? 'menu' : 'intro',
        currentGame: null,
        currentRound: 0,
      }
    }
  } catch {
    // Ignore parse errors
  }
  return createInitialState()
}

export function saveState(state: GameState): void {
  const toSave = {
    findWords: state.findWords,
    crossword: state.crossword,
    rearrange: state.rearrange,
    seenIntro: state.seenIntro,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

export function isGameComplete(state: GameState, gameType: GameType): boolean {
  return state[gameType].every((round) => round.completed)
}

export function isAllComplete(state: GameState): boolean {
  return (
    isGameComplete(state, 'findWords') &&
    isGameComplete(state, 'crossword') &&
    isGameComplete(state, 'rearrange')
  )
}

export function getCompletedCount(state: GameState, gameType: GameType): number {
  return state[gameType].filter((round) => round.completed).length
}

export function getTotalRounds(gameType: GameType): number {
  return ROUND_COUNTS[gameType]
}

export function getNextAvailableRound(state: GameState, gameType: GameType): number {
  const rounds = state[gameType]
  for (let i = 0; i < rounds.length; i++) {
    if (!rounds[i].completed) return i
  }
  return -1 // All complete
}

export function completeRound(
  state: GameState,
  gameType: GameType,
  roundIndex: number,
  data?: { foundWords?: string[]; answers?: Record<string, string> }
): GameState {
  const newState = { ...state }
  const rounds = [...state[gameType]]
  rounds[roundIndex] = { completed: true, ...data }
  newState[gameType] = rounds
  saveState(newState)
  return newState
}
