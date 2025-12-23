export class WordList {
  private container: HTMLElement
  private foundWords: string[] = []
  private totalRequired: number

  constructor(container: HTMLElement, totalRequired: number) {
    this.container = container
    this.totalRequired = totalRequired
  }

  render(): void {
    this.container.innerHTML = `
      <div class="word-list">
        <div class="word-list-header">
          <span class="word-list-title">Found Words</span>
          <span class="word-list-count">${this.foundWords.length}/${this.totalRequired}</span>
        </div>
        <div class="word-list-words">
          ${this.foundWords.length === 0
            ? '<p class="word-list-empty">Swipe to find words</p>'
            : this.foundWords.map((word) => `<span class="found-word">${word}</span>`).join('')
          }
        </div>
      </div>
    `
  }

  addWord(word: string): void {
    this.foundWords.push(word)
    this.render()
  }

  hasWord(word: string): boolean {
    return this.foundWords.includes(word)
  }

  getFoundWords(): string[] {
    return [...this.foundWords]
  }

  setFoundWords(words: string[]): void {
    this.foundWords = [...words]
    this.render()
  }

  isComplete(): boolean {
    return this.foundWords.length >= this.totalRequired
  }
}
