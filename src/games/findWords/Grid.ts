export interface GridCell {
  row: number
  col: number
  letter: string
}

export class Grid {
  private container: HTMLElement
  private grid: string[][]
  private selectedPath: GridCell[] = []
  private isSelecting = false
  private onWordSubmit: (word: string, path: GridCell[]) => void

  constructor(
    container: HTMLElement,
    grid: string[][],
    onWordSubmit: (word: string, path: GridCell[]) => void
  ) {
    this.container = container
    this.grid = grid
    this.onWordSubmit = onWordSubmit
  }

  render(): void {
    this.container.innerHTML = `
      <div class="find-words-grid no-select">
        ${this.grid
          .map(
            (row, rowIndex) => `
          <div class="grid-row">
            ${row
              .map(
                (letter, colIndex) => `
              <div
                class="grid-cell"
                data-row="${rowIndex}"
                data-col="${colIndex}"
              >
                <span class="cell-letter">${letter}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `
          )
          .join('')}
      </div>
      <div class="current-word"></div>
    `

    this.attachListeners()
  }

  private attachListeners(): void {
    const gridEl = this.container.querySelector('.find-words-grid') as HTMLElement

    // Mouse events
    gridEl.addEventListener('mousedown', (e) => this.handleStart(e))
    gridEl.addEventListener('mousemove', (e) => this.handleMove(e))
    gridEl.addEventListener('mouseup', () => this.handleEnd())
    gridEl.addEventListener('mouseleave', () => this.handleEnd())

    // Touch events
    gridEl.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false })
    gridEl.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false })
    gridEl.addEventListener('touchend', () => this.handleEnd())
    gridEl.addEventListener('touchcancel', () => this.handleEnd())
  }

  private handleStart(e: MouseEvent | TouchEvent): void {
    e.preventDefault()
    this.isSelecting = true
    this.selectedPath = []
    this.updateSelection(e)
  }

  private handleMove(e: MouseEvent | TouchEvent): void {
    if (!this.isSelecting) return
    e.preventDefault()
    this.updateSelection(e)
  }

  private handleEnd(): void {
    if (!this.isSelecting) return
    this.isSelecting = false

    if (this.selectedPath.length >= 5) {
      const word = this.selectedPath.map((c) => c.letter).join('')
      this.onWordSubmit(word, [...this.selectedPath])
    }

    this.selectedPath = []
    this.updateHighlight()
    this.updateCurrentWord()
  }

  private updateSelection(e: MouseEvent | TouchEvent): void {
    const cell = this.getCellFromEvent(e)
    if (!cell) return

    // Check if cell is already in path
    const existingIndex = this.selectedPath.findIndex(
      (c) => c.row === cell.row && c.col === cell.col
    )

    if (existingIndex >= 0) {
      // If going back, truncate path
      if (existingIndex === this.selectedPath.length - 2) {
        this.selectedPath = this.selectedPath.slice(0, existingIndex + 1)
      }
    } else {
      // Check if adjacent to last cell
      if (this.selectedPath.length === 0 || this.isAdjacent(cell)) {
        this.selectedPath.push(cell)
      }
    }

    this.updateHighlight()
    this.updateCurrentWord()
  }

  private getCellFromEvent(e: MouseEvent | TouchEvent): GridCell | null {
    let clientX: number, clientY: number

    if (e instanceof TouchEvent) {
      const touch = e.touches[0] || e.changedTouches[0]
      clientX = touch.clientX
      clientY = touch.clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const element = document.elementFromPoint(clientX, clientY)
    const cellEl = element?.closest('.grid-cell') as HTMLElement | null

    if (!cellEl) return null

    const row = parseInt(cellEl.dataset.row!, 10)
    const col = parseInt(cellEl.dataset.col!, 10)

    return { row, col, letter: this.grid[row][col] }
  }

  private isAdjacent(cell: GridCell): boolean {
    const last = this.selectedPath[this.selectedPath.length - 1]
    const rowDiff = Math.abs(cell.row - last.row)
    const colDiff = Math.abs(cell.col - last.col)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
  }

  private updateHighlight(): void {
    const cells = this.container.querySelectorAll('.grid-cell')
    cells.forEach((cell) => {
      const row = parseInt((cell as HTMLElement).dataset.row!, 10)
      const col = parseInt((cell as HTMLElement).dataset.col!, 10)
      const isSelected = this.selectedPath.some((c) => c.row === row && c.col === col)
      cell.classList.toggle('selected', isSelected)
    })
  }

  private updateCurrentWord(): void {
    const wordEl = this.container.querySelector('.current-word') as HTMLElement
    const word = this.selectedPath.map((c) => c.letter).join('')
    wordEl.textContent = word
    wordEl.classList.toggle('valid-length', word.length >= 5)
  }

  highlightWord(path: GridCell[]): void {
    const cells = this.container.querySelectorAll('.grid-cell')
    cells.forEach((cell) => {
      const row = parseInt((cell as HTMLElement).dataset.row!, 10)
      const col = parseInt((cell as HTMLElement).dataset.col!, 10)
      const isInPath = path.some((c) => c.row === row && c.col === col)
      cell.classList.toggle('found', isInPath)
    })

    // Remove highlight after animation
    setTimeout(() => {
      cells.forEach((cell) => cell.classList.remove('found'))
    }, 600)
  }

  shakeGrid(): void {
    const gridEl = this.container.querySelector('.find-words-grid')
    gridEl?.classList.add('shake')
    setTimeout(() => gridEl?.classList.remove('shake'), 400)
  }
}
