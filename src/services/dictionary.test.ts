import { describe, it, expect, beforeAll } from 'vitest'

// Create a testable dictionary class for unit testing
class TestDictionary {
  private root: { children: Map<string, any>; isWord: boolean } = {
    children: new Map(),
    isWord: false,
  }
  private wordSet: Set<string> = new Set()

  addWord(word: string): void {
    const upper = word.toUpperCase()
    this.wordSet.add(upper)

    let node = this.root
    for (const char of upper) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isWord: false })
      }
      node = node.children.get(char)!
    }
    node.isWord = true
  }

  loadWords(words: string[]): void {
    for (const word of words) {
      if (word.length >= 4) {
        this.addWord(word)
      }
    }
  }

  isValidWord(word: string): boolean {
    return this.wordSet.has(word.toUpperCase())
  }

  hasPrefix(prefix: string): boolean {
    let node = this.root
    for (const char of prefix.toUpperCase()) {
      if (!node.children.has(char)) {
        return false
      }
      node = node.children.get(char)!
    }
    return true
  }

  findAllWords(letters: string[]): string[] {
    const results: Set<string> = new Set()
    const available = letters.map((l) => l.toUpperCase())

    const dfs = (
      node: { children: Map<string, any>; isWord: boolean },
      path: string[],
      remaining: string[]
    ): void => {
      if (node.isWord && path.length >= 4) {
        results.add(path.join(''))
      }

      for (let i = 0; i < remaining.length; i++) {
        const letter = remaining[i]
        const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)]

        if (letter === '*') {
          for (const [char, child] of node.children) {
            path.push(char)
            dfs(child, path, newRemaining)
            path.pop()
          }
        } else if (node.children.has(letter)) {
          path.push(letter)
          dfs(node.children.get(letter)!, path, newRemaining)
          path.pop()
        }
      }
    }

    dfs(this.root, [], available)
    return Array.from(results).sort()
  }

  canFormWord(
    letters: string[],
    word: string
  ): { canForm: boolean; wildcardLetter?: string; wildcardPosition?: number } {
    const upperWord = word.toUpperCase()
    const available = [...letters.map((l) => l.toUpperCase())]
    let wildcardLetter: string | undefined
    let wildcardPosition: number | undefined

    for (let i = 0; i < upperWord.length; i++) {
      const char = upperWord[i]
      const index = available.indexOf(char)

      if (index >= 0) {
        available.splice(index, 1)
      } else {
        const wildcardIndex = available.indexOf('*')
        if (wildcardIndex >= 0 && wildcardLetter === undefined) {
          available.splice(wildcardIndex, 1)
          wildcardLetter = char
          wildcardPosition = i
        } else {
          return { canForm: false }
        }
      }
    }

    return { canForm: true, wildcardLetter, wildcardPosition }
  }

  matchWordPattern(pattern: string): { word: string; wildcardLetter?: string } | null {
    const upperPattern = pattern.toUpperCase()

    if (!upperPattern.includes('*')) {
      if (this.isValidWord(upperPattern)) {
        return { word: upperPattern }
      }
      return null
    }

    const wildcardPos = upperPattern.indexOf('*')

    for (let charCode = 65; charCode <= 90; charCode++) {
      const char = String.fromCharCode(charCode)
      const candidate =
        upperPattern.slice(0, wildcardPos) + char + upperPattern.slice(wildcardPos + 1)

      if (this.isValidWord(candidate)) {
        return { word: candidate, wildcardLetter: char }
      }
    }

    return null
  }
}

describe('Dictionary', () => {
  let dict: TestDictionary

  beforeAll(() => {
    dict = new TestDictionary()
    // Load a sample dictionary for testing
    dict.loadWords([
      'STAR',
      'STARS',
      'STARE',
      'STARED',
      'TARS',
      'RATS',
      'ARTS',
      'DEAR',
      'DEARS',
      'DARE',
      'DARES',
      'DATE',
      'DATES',
      'READ',
      'READS',
      'TRADE',
      'TRADES',
      'TREAD',
      'TREADS',
      'RATE',
      'RATES',
      'TEAR',
      'TEARS',
      'SEAT',
      'EATS',
      'TEST', // Short word - should be included
      'CAT', // Too short - should be excluded
      'PLAY',
      'PLAYS',
      'PLAYER',
      'LEAP',
      'PEAL',
      'PALE',
      'WORD',
      'WORDS',
      'SWORD',
    ])
  })

  describe('isValidWord', () => {
    it('returns true for valid words', () => {
      expect(dict.isValidWord('STAR')).toBe(true)
      expect(dict.isValidWord('STARED')).toBe(true)
      expect(dict.isValidWord('TRADE')).toBe(true)
    })

    it('returns false for invalid words', () => {
      expect(dict.isValidWord('ZZZZZ')).toBe(false)
      expect(dict.isValidWord('STARX')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(dict.isValidWord('star')).toBe(true)
      expect(dict.isValidWord('Star')).toBe(true)
      expect(dict.isValidWord('STAR')).toBe(true)
    })

    it('rejects words shorter than 4 letters', () => {
      expect(dict.isValidWord('CAT')).toBe(false)
    })
  })

  describe('hasPrefix', () => {
    it('returns true for valid prefixes', () => {
      expect(dict.hasPrefix('STA')).toBe(true)
      expect(dict.hasPrefix('STAR')).toBe(true)
      expect(dict.hasPrefix('STARE')).toBe(true)
    })

    it('returns false for invalid prefixes', () => {
      expect(dict.hasPrefix('ZZZ')).toBe(false)
      expect(dict.hasPrefix('STARX')).toBe(false)
    })
  })

  describe('canFormWord', () => {
    it('returns canForm true when word can be formed', () => {
      const result = dict.canFormWord(['S', 'T', 'A', 'R'], 'STAR')
      expect(result.canForm).toBe(true)
      expect(result.wildcardLetter).toBeUndefined()
    })

    it('returns canForm false when letters are insufficient', () => {
      const result = dict.canFormWord(['S', 'T', 'A'], 'STAR')
      expect(result.canForm).toBe(false)
    })

    it('uses wildcard correctly', () => {
      const result = dict.canFormWord(['S', 'T', 'A', '*'], 'STAR')
      expect(result.canForm).toBe(true)
      expect(result.wildcardLetter).toBe('R')
      expect(result.wildcardPosition).toBe(3)
    })

    it('uses wildcard in middle of word', () => {
      const result = dict.canFormWord(['S', '*', 'A', 'R'], 'STAR')
      expect(result.canForm).toBe(true)
      expect(result.wildcardLetter).toBe('T')
      expect(result.wildcardPosition).toBe(1)
    })

    it('uses wildcard only once', () => {
      const result = dict.canFormWord(['S', '*', 'A'], 'STAR')
      expect(result.canForm).toBe(false)
    })

    it('handles duplicate letters', () => {
      const result = dict.canFormWord(['S', 'T', 'A', 'R', 'S'], 'STARS')
      expect(result.canForm).toBe(true)
    })
  })

  describe('matchWordPattern', () => {
    it('matches exact words without wildcard', () => {
      const result = dict.matchWordPattern('STAR')
      expect(result).toEqual({ word: 'STAR' })
    })

    it('returns null for invalid words without wildcard', () => {
      const result = dict.matchWordPattern('ZZZZZ')
      expect(result).toBeNull()
    })

    it('matches words with wildcard', () => {
      const result = dict.matchWordPattern('STA*')
      expect(result).not.toBeNull()
      expect(result!.word).toBe('STAR')
      expect(result!.wildcardLetter).toBe('R')
    })

    it('matches wildcard in middle of word', () => {
      const result = dict.matchWordPattern('S*AR')
      expect(result).not.toBeNull()
      expect(result!.word).toBe('STAR')
      expect(result!.wildcardLetter).toBe('T')
    })

    it('returns null when no word matches pattern', () => {
      const result = dict.matchWordPattern('ZZZ*')
      expect(result).toBeNull()
    })

    it('is case insensitive', () => {
      const result = dict.matchWordPattern('sta*')
      expect(result).not.toBeNull()
      expect(result!.word).toBe('STAR')
    })
  })

  describe('findAllWords', () => {
    it('finds all valid words from letters', () => {
      const words = dict.findAllWords(['S', 'T', 'A', 'R'])
      expect(words).toContain('STAR')
      expect(words).toContain('TARS')
      expect(words).toContain('RATS')
      expect(words).toContain('ARTS')
    })

    it('finds words using wildcard', () => {
      const words = dict.findAllWords(['S', 'T', 'A', '*'])
      // With wildcard, we can form STAR (R), SEAT (E), EATS (E), etc.
      expect(words.length).toBeGreaterThan(0)
      expect(words).toContain('STAR')
      expect(words).toContain('SEAT')
      expect(words).toContain('EATS')
    })

    it('returns empty array when no words possible', () => {
      const words = dict.findAllWords(['Z', 'Z', 'Z', 'Z'])
      expect(words).toEqual([])
    })

    it('only returns words of 4+ letters', () => {
      const words = dict.findAllWords(['C', 'A', 'T', 'S'])
      words.forEach((word) => {
        expect(word.length).toBeGreaterThanOrEqual(4)
      })
    })
  })
})
