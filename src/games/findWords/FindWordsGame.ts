import type { GridCell } from './Grid'
import { Grid } from './Grid'
import { WordList } from './WordList'
import { findWordsPuzzles } from './puzzles'

export class FindWordsGame {
  private container: HTMLElement
  private roundIndex: number
  private grid: Grid | null = null
  private wordList: WordList | null = null
  private foundWords: string[] = []
  private onComplete: (foundWords: string[]) => void
  private onBack: () => void
  private isCompleted = false

  constructor(
    container: HTMLElement,
    roundIndex: number,
    savedWords: string[] | undefined,
    onComplete: (foundWords: string[]) => void,
    onBack: () => void
  ) {
    this.container = container
    this.roundIndex = roundIndex
    this.foundWords = savedWords ? [...savedWords] : []
    this.onComplete = onComplete
    this.onBack = onBack

    this.render()
  }

  private get puzzle() {
    return findWordsPuzzles[this.roundIndex]
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="find-words-game">
        <div class="game-header">
          <button class="back-button" aria-label="Back to menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="round-info">
            <span class="round-label">Find Words</span>
            <span class="round-number">Round ${this.roundIndex + 1} of 3</span>
          </div>
          <div class="spacer"></div>
        </div>
        <div class="game-instructions">
          Find ${this.puzzle.minWords}+ words (5+ letters)
        </div>
        <div id="grid-container"></div>
        <div id="word-list-container"></div>
      </div>
    `

    const gridContainer = this.container.querySelector('#grid-container') as HTMLElement
    const wordListContainer = this.container.querySelector('#word-list-container') as HTMLElement

    this.grid = new Grid(gridContainer, this.puzzle.grid, (word, path) => {
      this.handleWordSubmit(word, path)
    })
    this.grid.render()

    this.wordList = new WordList(wordListContainer, this.puzzle.minWords)
    if (this.foundWords.length > 0) {
      this.wordList.setFoundWords(this.foundWords)
    }
    this.wordList.render()

    this.container.querySelector('.back-button')?.addEventListener('click', () => {
      this.onBack()
    })
  }

  private handleWordSubmit(word: string, path: GridCell[]): void {
    if (this.isCompleted) return

    // Check if already found
    if (this.foundWords.includes(word)) {
      this.grid?.shakeGrid()
      return
    }

    // Check if valid word
    const isValid = this.puzzle.validWords.includes(word)

    if (isValid) {
      this.foundWords.push(word)
      this.wordList?.addWord(word)
      this.grid?.highlightWord(path)

      // Check completion
      if (this.foundWords.length >= this.puzzle.minWords && !this.isCompleted) {
        this.isCompleted = true
        setTimeout(() => {
          this.showCompletionScreen()
        }, 800)
      }
    } else {
      this.grid?.shakeGrid()
    }
  }

  private showCompletionScreen(): void {
    const missedWords = this.puzzle.validWords.filter(w => !this.foundWords.includes(w))

    this.container.innerHTML = `
      <div class="completion-screen">
        <div class="completion-header">
          <h2>Round Complete!</h2>
          <p>You found <strong>${this.foundWords.length}</strong> of <strong>${this.puzzle.validWords.length}</strong> words</p>
        </div>
        <div class="completion-words">
          <div class="words-section">
            <h3>Your Words (${this.foundWords.length})</h3>
            <div class="words-grid found">
              ${this.foundWords.sort().map(w => `<span class="word-chip found">${w}</span>`).join('')}
            </div>
          </div>
          ${missedWords.length > 0 ? `
            <div class="words-section">
              <h3>Words You Missed (${missedWords.length})</h3>
              <div class="words-grid missed">
                ${missedWords.sort().map(w => `<span class="word-chip missed">${w}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <button class="continue-btn">Continue</button>
      </div>
    `

    this.container.querySelector('.continue-btn')?.addEventListener('click', () => {
      this.onComplete([...this.foundWords])
    })
  }
}
