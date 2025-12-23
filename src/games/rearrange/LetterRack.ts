export interface LetterTile {
  id: number
  letter: string
  isWildcard: boolean
  inWord: boolean
}

export class LetterRack {
  private container: HTMLElement
  private tiles: LetterTile[]
  private currentWord: LetterTile[] = []
  private onWordSubmit: (word: string) => void

  constructor(
    container: HTMLElement,
    letters: string[],
    onWordSubmit: (word: string) => void
  ) {
    this.container = container
    this.tiles = letters.map((letter, i) => ({
      id: i,
      letter,
      isWildcard: false,
      inWord: false,
    }))
    this.onWordSubmit = onWordSubmit
  }

  render(): void {
    this.container.innerHTML = `
      <div class="rearrange-container">
        <div class="word-builder no-select">
          ${this.currentWord.length === 0
            ? '<span class="placeholder">Tap letters to build a word</span>'
            : this.currentWord.map((tile) => this.renderTile(tile, true)).join('')
          }
        </div>
        <div class="letter-rack no-select">
          ${this.tiles
            .filter((t) => !t.inWord)
            .map((tile) => this.renderTile(tile, false))
            .join('')}
        </div>
        <div class="rearrange-actions">
          <button class="action-btn clear-btn" ${this.currentWord.length === 0 ? 'disabled' : ''}>
            Clear
          </button>
          <button class="action-btn submit-btn" ${this.currentWord.length < 5 ? 'disabled' : ''}>
            Submit
          </button>
        </div>
      </div>
    `

    this.attachListeners()
  }

  private renderTile(tile: LetterTile, inBuilder: boolean): string {
    return `
      <button
        class="letter-tile ${tile.isWildcard ? 'wildcard' : ''} ${inBuilder ? 'in-builder' : ''}"
        data-id="${tile.id}"
        data-in-builder="${inBuilder}"
      >
        ${tile.letter}
      </button>
    `
  }

  private attachListeners(): void {
    // Letter tiles in rack
    this.container.querySelectorAll('.letter-tile').forEach((el) => {
      el.addEventListener('click', () => {
        const id = parseInt((el as HTMLElement).dataset.id!, 10)
        const inBuilder = (el as HTMLElement).dataset.inBuilder === 'true'

        if (inBuilder) {
          this.removeFromWord(id)
        } else {
          this.addToWord(id)
        }
      })
    })

    // Clear button
    this.container.querySelector('.clear-btn')?.addEventListener('click', () => {
      this.clearWord()
    })

    // Submit button
    this.container.querySelector('.submit-btn')?.addEventListener('click', () => {
      this.submitWord()
    })
  }

  private addToWord(id: number): void {
    const tile = this.tiles.find((t) => t.id === id)
    if (tile && !tile.inWord) {
      tile.inWord = true
      this.currentWord.push(tile)
      this.render()
    }
  }

  private removeFromWord(id: number): void {
    const tile = this.tiles.find((t) => t.id === id)
    if (tile && tile.inWord) {
      tile.inWord = false
      this.currentWord = this.currentWord.filter((t) => t.id !== id)
      this.render()
    }
  }

  private clearWord(): void {
    this.currentWord.forEach((tile) => {
      tile.inWord = false
    })
    this.currentWord = []
    this.render()
  }

  private submitWord(): void {
    if (this.currentWord.length >= 5) {
      const word = this.currentWord.map((t) => t.letter).join('')
      this.onWordSubmit(word)
      this.clearWord()
    }
  }

  shake(): void {
    const rack = this.container.querySelector('.letter-rack')
    rack?.classList.add('shake')
    setTimeout(() => rack?.classList.remove('shake'), 400)
  }

  flash(): void {
    const builder = this.container.querySelector('.word-builder')
    builder?.classList.add('flash')
    setTimeout(() => builder?.classList.remove('flash'), 400)
  }
}
