export interface RearrangePuzzle {
  letters: string[] // Letters in the rack (10 letters)
  minWords: number // Minimum 5-letter words to complete
  minSixLetterWords: number // Minimum 6-letter words to complete
}

// Puzzles use runtime dictionary validation - no need to hardcode valid words
// Each puzzle: 10 letters, find 5-letter and 6-letter words
export const rearrangePuzzles: RearrangePuzzle[] = [
  // Round 1 - STARED + LIN (contains: STARED, TRADES, STELAR, ALERTS, etc.)
  {
    letters: ['S', 'T', 'A', 'R', 'E', 'D', 'L', 'I', 'N', 'S'],
    minWords: 8,
    minSixLetterWords: 3,
  },
  // Round 2 - PLAYER + SON (contains: PLAYER, REPLAY, PARLEY, etc.)
  {
    letters: ['P', 'L', 'A', 'Y', 'E', 'R', 'S', 'O', 'N', 'E'],
    minWords: 8,
    minSixLetterWords: 3,
  },
  // Round 3 - SWORDS + TEA (contains: SWORDS, STEWARD, etc.)
  {
    letters: ['S', 'W', 'O', 'R', 'D', 'S', 'T', 'E', 'A', 'R'],
    minWords: 8,
    minSixLetterWords: 3,
  },
  // Round 4 - MASTER + GIN (contains: MASTER, STREAM, GAMEST, etc.)
  {
    letters: ['M', 'A', 'S', 'T', 'E', 'R', 'G', 'I', 'N', 'S'],
    minWords: 10,
    minSixLetterWords: 4,
  },
  // Round 5 - PHONES + ART (contains: ORPHAN, PATHOS, etc.)
  {
    letters: ['P', 'H', 'O', 'N', 'E', 'S', 'A', 'R', 'T', 'H'],
    minWords: 10,
    minSixLetterWords: 5,
  },
]
