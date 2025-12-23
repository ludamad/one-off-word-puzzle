import type { CrosswordPuzzle, CrosswordClue } from './puzzles'
import { createGrid, getAnswerGrid, getClueNumbers } from './puzzles'

export class CrosswordGrid {
  private container: HTMLElement
  private puzzle: CrosswordPuzzle
  private userGrid: (string | null)[][]
  private answerGrid: (string | null)[][]
  private clueNumbers: (number | null)[][]
  private selectedCell: { row: number; col: number } | null = null
  private direction: 'across' | 'down' = 'across'
  private onCellChange: () => void
  private completedClues: Set<string> = new Set()

  constructor(
    container: HTMLElement,
    puzzle: CrosswordPuzzle,
    savedAnswers: Record<string, string> | undefined,
    onCellChange: () => void
  ) {
    this.container = container
    this.puzzle = puzzle
    this.userGrid = createGrid(puzzle)
    this.answerGrid = getAnswerGrid(puzzle)
    this.clueNumbers = getClueNumbers(puzzle)
    this.onCellChange = onCellChange

    // Restore saved answers
    if (savedAnswers) {
      for (const [key, value] of Object.entries(savedAnswers)) {
        const [row, col] = key.split(',').map(Number)
        if (this.userGrid[row] && this.userGrid[row][col] !== null) {
          this.userGrid[row][col] = value
        }
      }
    }
  }

  render(): void {
    this.container.innerHTML = `
      <div class="crossword-grid no-select">
        ${this.userGrid
          .map(
            (row, rowIndex) => `
          <div class="crossword-row">
            ${row
              .map((cell, colIndex) => {
                if (cell === null) {
                  return `<div class="crossword-cell blocked"></div>`
                }
                const number = this.clueNumbers[rowIndex][colIndex]
                const isSelected = this.selectedCell?.row === rowIndex && this.selectedCell?.col === colIndex
                const isCompleted = this.getCompletedClueAtCell(rowIndex, colIndex) !== null
                return `
                  <div
                    class="crossword-cell ${isSelected ? 'selected' : ''} ${isCompleted ? 'correct' : ''}"
                    data-row="${rowIndex}"
                    data-col="${colIndex}"
                  >
                    ${number ? `<span class="cell-number">${number}</span>` : ''}
                    <span class="cell-letter">${cell}</span>
                  </div>
                `
              })
              .join('')}
          </div>
        `
          )
          .join('')}
      </div>
      <div class="word-input-modal" id="word-input-modal">
        <div class="word-input-content">
          <div class="word-input-clue" id="modal-clue"></div>
          <input
            type="text"
            id="word-input"
            class="word-input-field"
            autocomplete="off"
            autocapitalize="characters"
            placeholder="Type the word..."
          />
          <div class="word-input-actions">
            <button class="word-input-cancel">Cancel</button>
            <button class="word-input-submit">Submit</button>
          </div>
        </div>
      </div>
    `

    this.attachListeners()
  }

  private attachListeners(): void {
    const cells = this.container.querySelectorAll('.crossword-cell:not(.blocked)')
    const modal = this.container.querySelector('#word-input-modal') as HTMLElement
    const modalClue = this.container.querySelector('#modal-clue') as HTMLElement
    const wordInput = this.container.querySelector('#word-input') as HTMLInputElement
    const cancelBtn = this.container.querySelector('.word-input-cancel') as HTMLButtonElement
    const submitBtn = this.container.querySelector('.word-input-submit') as HTMLButtonElement

    cells.forEach((cell) => {
      const row = parseInt((cell as HTMLElement).dataset.row!, 10)
      const col = parseInt((cell as HTMLElement).dataset.col!, 10)

      cell.addEventListener('click', () => {
        // Skip if this cell is part of a completed word
        if (this.getCompletedClueAtCell(row, col)) return

        if (this.selectedCell?.row === row && this.selectedCell?.col === col) {
          // Toggle direction on same cell click
          this.direction = this.direction === 'across' ? 'down' : 'across'
        }
        this.selectCell(row, col)
        this.highlightCells()

        // Find the clue for this cell
        const clue = this.findClueForCell(row, col, this.direction)
        if (clue) {
          // Show modal with clue
          modalClue.textContent = `${clue.number} ${clue.direction.toUpperCase()}: ${clue.clue}`
          wordInput.value = ''
          wordInput.maxLength = clue.answer.length
          wordInput.placeholder = `${clue.answer.length} letters...`
          modal.classList.add('visible')
          wordInput.focus()
        }
      })
    })

    // Modal cancel
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('visible')
    })

    // Modal submit
    submitBtn.addEventListener('click', () => {
      this.submitModalWord()
    })

    // Submit on Enter
    wordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.submitModalWord()
      } else if (e.key === 'Escape') {
        modal.classList.remove('visible')
      }
    })

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('visible')
      }
    })
  }

  private submitModalWord(): void {
    const modal = this.container.querySelector('#word-input-modal') as HTMLElement
    const wordInput = this.container.querySelector('#word-input') as HTMLInputElement
    const word = wordInput.value.toUpperCase()

    if (!this.selectedCell) return

    const clue = this.findClueForCell(this.selectedCell.row, this.selectedCell.col, this.direction)
    if (!clue) return

    // Fill in the word
    const cells = this.getClueCells(clue)
    for (let i = 0; i < cells.length && i < word.length; i++) {
      const { row, col } = cells[i]
      // Only fill if not part of a completed clue
      if (!this.getCompletedClueAtCell(row, col)) {
        this.userGrid[row][col] = word[i] || ''
      }
    }

    this.onCellChange()
    modal.classList.remove('visible')

    // Check if word is complete and validate
    if (word.length === clue.answer.length) {
      this.checkWordCompletion(this.selectedCell.row, this.selectedCell.col)
    }

    this.render()
  }

  private selectCell(row: number, col: number): void {
    this.selectedCell = { row, col }
    this.highlightCells()
  }

  private highlightCells(): void {
    const cells = this.container.querySelectorAll('.crossword-cell')
    cells.forEach((cell) => {
      cell.classList.remove('selected', 'highlighted')
    })

    if (!this.selectedCell) return

    const { row, col } = this.selectedCell
    const cellEl = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    cellEl?.classList.add('selected')

    // Highlight word in current direction
    this.getWordCells(row, col, this.direction).forEach(({ row: r, col: c }) => {
      const el = this.container.querySelector(`[data-row="${r}"][data-col="${c}"]`)
      el?.classList.add('highlighted')
    })
  }

  private getWordCells(row: number, col: number, dir: 'across' | 'down'): { row: number; col: number }[] {
    const cells: { row: number; col: number }[] = []
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0

    // Find start of word
    let r = row, c = col
    while (r - dr >= 0 && c - dc >= 0 && this.userGrid[r - dr]?.[c - dc] !== null) {
      r -= dr
      c -= dc
    }

    // Collect all cells in word
    while (r < this.puzzle.height && c < this.puzzle.width && this.userGrid[r]?.[c] !== null) {
      cells.push({ row: r, col: c })
      r += dr
      c += dc
    }

    return cells
  }

  private checkWordCompletion(row: number, col: number): void {
    // Check both directions for completed words
    for (const dir of ['across', 'down'] as const) {
      const clue = this.findClueForCell(row, col, dir)
      if (!clue) continue

      const clueKey = `${clue.number}-${clue.direction}`
      if (this.completedClues.has(clueKey)) continue

      // Get all cells for this clue's word
      const cells = this.getClueCells(clue)

      // Check if all cells are filled
      const allFilled = cells.every(({ row: r, col: c }) =>
        this.userGrid[r][c] && this.userGrid[r][c] !== ''
      )

      if (!allFilled) continue

      // Get user's word
      const userWord = cells.map(({ row: r, col: c }) => this.userGrid[r][c]).join('')

      if (userWord === clue.answer) {
        // Correct! Mark as completed
        this.completedClues.add(clueKey)
        this.highlightWordCorrect(cells)
      } else {
        // Wrong - highlight red and clear
        this.highlightWordWrong(cells)
      }
    }
  }

  private findClueForCell(row: number, col: number, dir: 'across' | 'down'): CrosswordClue | null {
    for (const clue of this.puzzle.clues) {
      if (clue.direction !== dir) continue

      const cells = this.getClueCells(clue)
      if (cells.some(c => c.row === row && c.col === col)) {
        return clue
      }
    }
    return null
  }

  private getClueCells(clue: CrosswordClue): { row: number; col: number }[] {
    const cells: { row: number; col: number }[] = []
    const dr = clue.direction === 'down' ? 1 : 0
    const dc = clue.direction === 'across' ? 1 : 0

    for (let i = 0; i < clue.answer.length; i++) {
      cells.push({ row: clue.row + i * dr, col: clue.col + i * dc })
    }
    return cells
  }

  private highlightWordCorrect(cells: { row: number; col: number }[]): void {
    cells.forEach(({ row, col }) => {
      const cellEl = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
      cellEl?.classList.add('correct')
    })
  }

  private highlightWordWrong(cells: { row: number; col: number }[]): void {
    cells.forEach(({ row, col }) => {
      const cellEl = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
      cellEl?.classList.add('wrong')
    })

    // Clear after animation
    setTimeout(() => {
      cells.forEach(({ row, col }) => {
        // Only clear if not part of a completed word
        const clueKey = this.getCompletedClueAtCell(row, col)
        if (!clueKey) {
          this.userGrid[row][col] = ''
        }
        const cellEl = this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
        cellEl?.classList.remove('wrong')
      })
      this.render()
    }, 800)
  }

  private getCompletedClueAtCell(row: number, col: number): string | null {
    for (const clue of this.puzzle.clues) {
      const clueKey = `${clue.number}-${clue.direction}`
      if (!this.completedClues.has(clueKey)) continue

      const cells = this.getClueCells(clue)
      if (cells.some(c => c.row === row && c.col === col)) {
        return clueKey
      }
    }
    return null
  }

  isComplete(): boolean {
    for (let r = 0; r < this.puzzle.height; r++) {
      for (let c = 0; c < this.puzzle.width; c++) {
        if (this.answerGrid[r][c] !== null) {
          if (this.userGrid[r][c] !== this.answerGrid[r][c]) {
            return false
          }
        }
      }
    }
    return true
  }

  getAnswers(): Record<string, string> {
    const answers: Record<string, string> = {}
    for (let r = 0; r < this.puzzle.height; r++) {
      for (let c = 0; c < this.puzzle.width; c++) {
        if (this.userGrid[r][c] !== null && this.userGrid[r][c] !== '') {
          answers[`${r},${c}`] = this.userGrid[r][c]!
        }
      }
    }
    return answers
  }

  setDirection(direction: 'across' | 'down'): void {
    this.direction = direction
    this.highlightCells()
  }

  focusClue(clue: { row: number; col: number; direction: 'across' | 'down' }): void {
    // Skip if this clue is already completed
    const clueData = this.puzzle.clues.find(
      c => c.row === clue.row && c.col === clue.col && c.direction === clue.direction
    )
    if (!clueData) return

    const clueKey = `${clueData.number}-${clueData.direction}`
    if (this.completedClues.has(clueKey)) return

    this.direction = clue.direction
    this.selectCell(clue.row, clue.col)
    this.highlightCells()

    // Show the modal
    const modal = this.container.querySelector('#word-input-modal') as HTMLElement
    const modalClue = this.container.querySelector('#modal-clue') as HTMLElement
    const wordInput = this.container.querySelector('#word-input') as HTMLInputElement

    modalClue.textContent = `${clueData.number} ${clueData.direction.toUpperCase()}: ${clueData.clue}`
    wordInput.value = ''
    wordInput.maxLength = clueData.answer.length
    wordInput.placeholder = `${clueData.answer.length} letters...`
    modal.classList.add('visible')
    wordInput.focus()
  }
}
