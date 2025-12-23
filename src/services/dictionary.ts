// Dictionary service for word validation
// Uses a trie for efficient prefix matching and word lookup

interface TrieNode {
  children: Map<string, TrieNode>
  isWord: boolean
}

class Dictionary {
  private root: TrieNode = { children: new Map(), isWord: false }
  private wordSet: Set<string> = new Set()
  private loaded = false

  async load(): Promise<void> {
    if (this.loaded) return

    const response = await fetch('/dictionary.txt')
    const text = await response.text()
    const words = text
      .split('\n')
      .map((w) => w.trim().toUpperCase())
      .filter((w) => w.length >= 5)

    for (const word of words) {
      this.addWord(word)
    }

    this.loaded = true
  }

  private addWord(word: string): void {
    this.wordSet.add(word)

    let node = this.root
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, { children: new Map(), isWord: false })
      }
      node = node.children.get(char)!
    }
    node.isWord = true
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

  // Find all valid words that can be formed from letters
  findAllWords(letters: string[]): string[] {
    const results: Set<string> = new Set()
    const available = letters.map((l) => l.toUpperCase())

    const dfs = (node: TrieNode, path: string[], remaining: string[]): void => {
      if (node.isWord && path.length >= 5) {
        results.add(path.join(''))
      }

      for (let i = 0; i < remaining.length; i++) {
        const letter = remaining[i]
        const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)]

        if (letter === '*') {
          // Wildcard: try all possible letters
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

  // Check if a word can be formed from given letters and return the wildcard assignment
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
        // Try using wildcard
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

  // Match a word pattern with wildcards against dictionary
  matchWordPattern(pattern: string): { word: string; wildcardLetter?: string } | null {
    const upperPattern = pattern.toUpperCase()

    // If no wildcard, just validate directly
    if (!upperPattern.includes('*')) {
      if (this.isValidWord(upperPattern)) {
        return { word: upperPattern }
      }
      return null
    }

    // Find the wildcard position
    const wildcardPos = upperPattern.indexOf('*')

    // Try each letter of the alphabet for the wildcard
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

// Singleton instance
export const dictionary = new Dictionary()
