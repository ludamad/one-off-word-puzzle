import type { GameState, GameType } from '../state/gameState'
import { getCompletedCount, getTotalRounds } from '../state/gameState'

const GAME_LABELS: Record<GameType, string> = {
  findWords: 'Find Words',
  crossword: 'Crosswords',
  rearrange: 'Rearrange',
}

export class ProgressTracker {
  private container: HTMLElement
  private state: GameState

  constructor(container: HTMLElement, state: GameState) {
    this.container = container
    this.state = state
  }

  update(state: GameState): void {
    this.state = state
    this.render()
  }

  render(): void {
    const total = 10 // 3 + 2 + 5
    const completed =
      getCompletedCount(this.state, 'findWords') +
      getCompletedCount(this.state, 'crossword') +
      getCompletedCount(this.state, 'rearrange')

    this.container.innerHTML = `
      <div class="progress-tracker">
        <div class="progress-header">
          <span class="progress-label">Progress</span>
          <span class="progress-count">${completed}/${total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(completed / total) * 100}%"></div>
        </div>
        <div class="progress-categories">
          ${this.renderCategory('findWords')}
          ${this.renderCategory('crossword')}
          ${this.renderCategory('rearrange')}
        </div>
      </div>
    `
  }

  private renderCategory(gameType: GameType): string {
    const completed = getCompletedCount(this.state, gameType)
    const total = getTotalRounds(gameType)
    const isComplete = completed === total

    return `
      <div class="progress-category ${isComplete ? 'complete' : ''}">
        <span class="category-name">${GAME_LABELS[gameType]}</span>
        <span class="category-count">${completed}/${total}</span>
      </div>
    `
  }
}
