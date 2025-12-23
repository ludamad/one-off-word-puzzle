import { LetterRack } from './LetterRack'
import { rearrangePuzzles } from './puzzles'
import { dictionary } from '../../services/dictionary'

export interface FoundWord {
  word: string
}

export class RearrangeGame {
  private container: HTMLElement
  private roundIndex: number
  private rack: LetterRack | null = null
  private foundWords: FoundWord[] = []
  private onComplete: (foundWords: string[]) => void
  private onBack: () => void

  constructor(
    container: HTMLElement,
    roundIndex: number,
    savedWords: string[] | undefined,
    onComplete: (foundWords: string[]) => void,
    onBack: () => void
  ) {
    this.container = container
    this.roundIndex = roundIndex
    this.foundWords = savedWords ? savedWords.map((w) => ({ word: w })) : []
    this.onComplete = onComplete
    this.onBack = onBack

    this.init()
  }

  private async init(): Promise<void> {
    // Show loading state
    this.container.innerHTML = `<div class="loading-screen"><p>Loading dictionary...</p></div>`

    await dictionary.load()
    this.render()
  }

  private get puzzle() {
    return rearrangePuzzles[this.roundIndex]
  }

  private get fiveLetterWords(): FoundWord[] {
    return this.foundWords.filter(fw => fw.word.length === 5)
  }

  private get sixLetterWords(): FoundWord[] {
    return this.foundWords.filter(fw => fw.word.length >= 6)
  }

  private render(): void {
    const fiveCount = this.fiveLetterWords.length
    const sixCount = this.sixLetterWords.length

    this.container.innerHTML = `
      <div class="rearrange-game">
        <div class="game-header">
          <button class="back-button" aria-label="Back to menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div class="round-info">
            <span class="round-label">Rearrange</span>
            <span class="round-number">Round ${this.roundIndex + 1} of 5</span>
          </div>
          <div class="spacer"></div>
        </div>
        <div class="game-instructions">
          Find ${this.puzzle.minWords}+ words (5 letters) + ${this.puzzle.minSixLetterWords} words (6+ letters)
        </div>
        <div id="rack-container"></div>
        <div class="word-list">
          <div class="word-list-header">
            <span class="word-list-title">5-letter: ${fiveCount}/${this.puzzle.minWords}</span>
            <span class="word-list-title">6+ letter: ${sixCount}/${this.puzzle.minSixLetterWords}</span>
          </div>
          <div class="word-list-words">
            ${this.foundWords.length === 0
              ? '<p class="word-list-empty">Tap letters to build words</p>'
              : this.foundWords.map((fw) => this.renderFoundWord(fw)).join('')
            }
          </div>
        </div>
      </div>
    `

    const rackContainer = this.container.querySelector('#rack-container') as HTMLElement
    this.rack = new LetterRack(rackContainer, this.puzzle.letters, (word) => {
      this.handleWordSubmit(word)
    })
    this.rack.render()

    this.container.querySelector('.back-button')?.addEventListener('click', () => {
      this.onBack()
    })
  }

  private renderFoundWord(fw: FoundWord): string {
    const lengthClass = fw.word.length >= 6 ? 'six-letter' : 'five-letter'
    return `<span class="found-word ${lengthClass}">${fw.word}</span>`
  }

  private handleWordSubmit(word: string): void {
    const upperWord = word.toUpperCase()

    // Validate word is in dictionary
    if (!dictionary.isValidWord(upperWord)) {
      this.rack?.shake()
      return
    }

    // Check if already found
    if (this.foundWords.some((fw) => fw.word === upperWord)) {
      this.rack?.shake()
      return
    }

    // Valid new word!
    this.foundWords.push({ word: upperWord })
    this.rack?.flash()
    this.render()

    // Check completion - need both goals met
    const fiveComplete = this.fiveLetterWords.length >= this.puzzle.minWords
    const sixComplete = this.sixLetterWords.length >= this.puzzle.minSixLetterWords

    if (fiveComplete && sixComplete) {
      setTimeout(() => {
        this.onComplete(this.foundWords.map((fw) => fw.word))
      }, 800)
    }
  }
}
