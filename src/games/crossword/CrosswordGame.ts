import { CrosswordGrid } from './CrosswordGrid'
import { Clues } from './Clues'
import { crosswordPuzzles } from './puzzles'

export class CrosswordGame {
  private container: HTMLElement
  private roundIndex: number
  private grid: CrosswordGrid | null = null
  private clues: Clues | null = null
  private onComplete: (answers: Record<string, string>) => void
  private onBack: () => void

  constructor(
    container: HTMLElement,
    roundIndex: number,
    savedAnswers: Record<string, string> | undefined,
    onComplete: (answers: Record<string, string>) => void,
    onBack: () => void
  ) {
    this.container = container
    this.roundIndex = roundIndex
    this.onComplete = onComplete
    this.onBack = onBack

    this.render(savedAnswers)
  }

  private get puzzle() {
    return crosswordPuzzles[this.roundIndex]
  }

  private render(savedAnswers?: Record<string, string>): void {
    this.container.innerHTML = `
      <div class="crossword-game">
        <div class="game-header">
          <button class="back-button" aria-label="Back to menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="round-info">
            <span class="round-label">Crossword: ${this.puzzle.theme}</span>
            <span class="round-number">Round ${this.roundIndex + 1} of 2</span>
          </div>
          <div class="spacer"></div>
        </div>
        <div id="grid-container"></div>
        <div id="clues-container"></div>
      </div>
    `

    const gridContainer = this.container.querySelector('#grid-container') as HTMLElement
    const cluesContainer = this.container.querySelector('#clues-container') as HTMLElement

    this.grid = new CrosswordGrid(gridContainer, this.puzzle, savedAnswers, () => {
      this.checkCompletion()
    })
    this.grid.render()

    this.clues = new Clues(cluesContainer, this.puzzle.clues, (clue) => {
      this.grid?.focusClue(clue)
    })
    this.clues.render()

    this.container.querySelector('.back-button')?.addEventListener('click', () => {
      this.onBack()
    })
  }

  private checkCompletion(): void {
    if (this.grid?.isComplete()) {
      setTimeout(() => {
        this.onComplete(this.grid!.getAnswers())
      }, 500)
    }
  }
}
