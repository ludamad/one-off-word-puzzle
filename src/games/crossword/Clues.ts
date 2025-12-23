import type { CrosswordClue } from './puzzles'

export class Clues {
  private container: HTMLElement
  private clues: CrosswordClue[]
  private onClueClick: (clue: CrosswordClue) => void

  constructor(
    container: HTMLElement,
    clues: CrosswordClue[],
    onClueClick: (clue: CrosswordClue) => void
  ) {
    this.container = container
    this.clues = clues
    this.onClueClick = onClueClick
  }

  render(): void {
    const acrossClues = this.clues.filter((c) => c.direction === 'across')
    const downClues = this.clues.filter((c) => c.direction === 'down')

    this.container.innerHTML = `
      <div class="clues-container">
        <div class="clues-section">
          <h3 class="clues-title">Across</h3>
          <ul class="clues-list">
            ${acrossClues
              .map(
                (clue) => `
              <li class="clue-item" data-number="${clue.number}" data-direction="across">
                <span class="clue-number">${clue.number}.</span>
                <span class="clue-text">${clue.clue}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
        <div class="clues-section">
          <h3 class="clues-title">Down</h3>
          <ul class="clues-list">
            ${downClues
              .map(
                (clue) => `
              <li class="clue-item" data-number="${clue.number}" data-direction="down">
                <span class="clue-number">${clue.number}.</span>
                <span class="clue-text">${clue.clue}</span>
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>
    `

    this.attachListeners()
  }

  private attachListeners(): void {
    this.container.querySelectorAll('.clue-item').forEach((item) => {
      item.addEventListener('click', () => {
        const number = parseInt((item as HTMLElement).dataset.number!, 10)
        const direction = (item as HTMLElement).dataset.direction as 'across' | 'down'
        const clue = this.clues.find((c) => c.number === number && c.direction === direction)
        if (clue) {
          this.onClueClick(clue)
        }
      })
    })
  }
}
