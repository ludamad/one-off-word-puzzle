// Script to find all valid words in a boggle grid using the dictionary
const fs = require('fs');
const path = require('path');

// Load dictionary
const dictPath = path.join(__dirname, '..', 'dictionary.txt');
const dictionary = new Set(
  fs.readFileSync(dictPath, 'utf8')
    .split('\n')
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length >= 4)
);

// Also create a prefix set for early termination
const prefixes = new Set();
for (const word of dictionary) {
  for (let i = 1; i <= word.length; i++) {
    prefixes.add(word.slice(0, i));
  }
}

function findWordsInGrid(grid) {
  const rows = grid.length;
  const cols = grid[0].length;
  const foundWords = new Set();

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0], [1, 1],
  ];

  function dfs(row, col, path, visited) {
    const word = path.join('');

    // Early termination if not a valid prefix
    if (!prefixes.has(word)) return;

    // Check if valid word (4+ letters)
    if (word.length >= 4 && dictionary.has(word)) {
      foundWords.add(word);
    }

    // Continue searching
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const key = `${newRow},${newCol}`;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited.has(key)
      ) {
        visited.add(key);
        path.push(grid[newRow][newCol]);
        dfs(newRow, newCol, path, visited);
        path.pop();
        visited.delete(key);
      }
    }
  }

  // Start DFS from each cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const visited = new Set([`${row},${col}`]);
      dfs(row, col, [grid[row][col]], visited);
    }
  }

  return Array.from(foundWords).sort();
}

// Define the grids
const grids = [
  // Grid 1
  [
    ['S', 'T', 'A', 'R', 'E'],
    ['H', 'E', 'A', 'R', 'S'],
    ['O', 'W', 'L', 'E', 'D'],
    ['P', 'E', 'R', 'S', 'O'],
    ['S', 'T', 'E', 'P', 'S'],
  ],
  // Grid 2
  [
    ['L', 'I', 'G', 'H', 'T'],
    ['O', 'N', 'E', 'S', 'A'],
    ['V', 'E', 'R', 'S', 'T'],
    ['E', 'D', 'G', 'E', 'S'],
    ['S', 'P', 'O', 'T', 'S'],
  ],
  // Grid 3
  [
    ['P', 'L', 'A', 'Y', 'S'],
    ['H', 'O', 'N', 'E', 'T'],
    ['O', 'T', 'E', 'S', 'A'],
    ['N', 'E', 'S', 'T', 'R'],
    ['E', 'S', 'S', 'A', 'Y'],
  ],
];

console.log('Finding all valid 4+ letter words in each grid...\n');

grids.forEach((grid, i) => {
  console.log(`\n=== GRID ${i + 1} ===`);
  console.log(grid.map(row => row.join(' ')).join('\n'));

  const words = findWordsInGrid(grid);
  console.log(`\nFound ${words.length} words:`);

  // Group by length
  const byLength = {};
  for (const word of words) {
    const len = word.length;
    if (!byLength[len]) byLength[len] = [];
    byLength[len].push(word);
  }

  for (const len of Object.keys(byLength).sort((a, b) => a - b)) {
    console.log(`  ${len} letters (${byLength[len].length}): ${byLength[len].join(', ')}`);
  }

  console.log(`\nArray for puzzles.ts:`);
  console.log(`validWords: ${JSON.stringify(words)},`);
});
