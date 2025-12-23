import type { GameState, GameType } from '../state/gameState'
import {
  getCompletedCount,
  getTotalRounds,
  isGameComplete,
  getNextAvailableRound,
} from '../state/gameState'

const GAME_INFO: Record<GameType, { label: string; description: string }> = {
  findWords: {
    label: 'Find Words',
    description: 'Find hidden words in a letter grid',
  },
  crossword: {
    label: 'Crosswords',
    description: 'Solve themed crossword puzzles',
  },
  rearrange: {
    label: 'Rearrange',
    description: 'Build words from letter tiles',
  },
}

export class Navigation {
  private container: HTMLElement
  private state: GameState
  private onSelectGame: (gameType: GameType, round: number) => void

  constructor(
    container: HTMLElement,
    state: GameState,
    onSelectGame: (gameType: GameType, round: number) => void
  ) {
    this.container = container
    this.state = state
    this.onSelectGame = onSelectGame
  }

  update(state: GameState): void {
    this.state = state
    this.render()
  }

  render(): void {
    this.container.innerHTML = `
      <nav class="game-navigation">
        <h2 class="nav-title">Choose a Puzzle</h2>
        <div class="game-cards">
          ${this.renderGameCard('findWords')}
          ${this.renderGameCard('crossword')}
          ${this.renderGameCard('rearrange')}
        </div>
      </nav>
    `

    this.attachListeners()
  }

  private renderGameCard(gameType: GameType): string {
    const info = GAME_INFO[gameType]
    const completed = getCompletedCount(this.state, gameType)
    const total = getTotalRounds(gameType)
    const isComplete = isGameComplete(this.state, gameType)

    return `
      <button
        class="game-card ${isComplete ? 'complete' : ''}"
        data-game="${gameType}"
        ${isComplete ? 'disabled' : ''}
      >
        <div class="card-content">
          <h3 class="card-title">${info.label}</h3>
          <p class="card-description">${info.description}</p>
          <div class="card-progress">
            <span class="rounds-complete">${completed}/${total} rounds</span>
            ${isComplete ? '<span class="complete-badge">Complete</span>' : ''}
          </div>
        </div>
        <div class="card-dots">
          ${Array.from({ length: total }, (_, i) =>
            `<span class="dot ${this.state[gameType][i].completed ? 'filled' : ''}"></span>`
          ).join('')}
        </div>
      </button>
    `
  }

  private attachListeners(): void {
    this.container.querySelectorAll('.game-card').forEach((card) => {
      card.addEventListener('click', () => {
        const gameType = card.getAttribute('data-game') as GameType
        const nextRound = getNextAvailableRound(this.state, gameType)
        if (nextRound >= 0) {
          this.onSelectGame(gameType, nextRound)
        }
      })
    })
  }
}
