// Script to find all valid words that can be formed from rearrange puzzle letters
const fs = require('fs')
const path = require('path')

// Load dictionary
const dictPath = path.join(__dirname, '..', 'dictionary.txt')
const dictionary = new Set(
  fs.readFileSync(dictPath, 'utf8')
    .split('\n')
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w.length >= 4)
)

// Build trie for efficient search
class TrieNode {
  constructor() {
    this.children = new Map()
    this.isWord = false
  }
}

const root = new TrieNode()

for (const word of dictionary) {
  let node = root
  for (const char of word) {
    if (!node.children.has(char)) {
      node.children.set(char, new TrieNode())
    }
    node = node.children.get(char)
  }
  node.isWord = true
}

function findAllWords(letters) {
  const results = new Set()
  const available = letters.map((l) => l.toUpperCase())

  function dfs(node, path, remaining) {
    if (node.isWord && path.length >= 4) {
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
        dfs(node.children.get(letter), path, newRemaining)
        path.pop()
      }
    }
  }

  dfs(root, [], available)
  return Array.from(results).sort()
}

// Puzzle letters
const puzzles = [
  ['S', 'T', 'A', 'R', '*', 'E', 'D'], // Round 1
  ['P', 'L', 'A', 'Y', 'E', '*', 'S'], // Round 2
  ['W', 'O', 'R', 'D', '*', 'S', 'E'], // Round 3
  ['G', 'A', 'M', 'E', '*', 'S', 'T'], // Round 4
  ['P', 'H', 'O', 'T', '*', 'N', 'E'], // Round 5
]

console.log('Finding all valid 4+ letter words for each rearrange puzzle...\n')

puzzles.forEach((letters, i) => {
  console.log(`\n=== ROUND ${i + 1} ===`)
  console.log(`Letters: ${letters.join(', ')}`)

  const words = findAllWords(letters)
  console.log(`Found ${words.length} words:`)

  // Group by length
  const byLength = {}
  for (const word of words) {
    const len = word.length
    if (!byLength[len]) byLength[len] = []
    byLength[len].push(word)
  }

  for (const len of Object.keys(byLength).sort((a, b) => a - b)) {
    console.log(`  ${len} letters (${byLength[len].length}): ${byLength[len].join(', ')}`)
  }

  console.log(`\nArray for puzzles.ts:`)
  console.log(`validWords: ${JSON.stringify(words)},`)
})
