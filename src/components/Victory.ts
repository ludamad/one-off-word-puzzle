import { decrypt, ENCRYPTED_COMBO } from '../utils/crypto'

export class Victory {
  private container: HTMLElement
  private revealed = false

  constructor(container: HTMLElement) {
    this.container = container
  }

  render(): void {
    this.container.innerHTML = `
      <div class="victory-screen">
        <div class="victory-content">
          <div class="victory-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="3"/>
              <path d="M20 32l8 8 16-16" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="victory-title">Congratulations!</h1>
          <p class="victory-subtitle">You solved all the puzzles!</p>

          <div class="combo-reveal ${this.revealed ? 'revealed' : ''}">
            ${this.revealed ? this.renderCombo() : this.renderRevealButton()}
          </div>

          <p class="victory-hint">
            ${this.revealed ? 'Use this combination to open the box!' : ''}
          </p>
        </div>
      </div>
    `

    if (!this.revealed) {
      this.container.querySelector('.reveal-button')?.addEventListener('click', () => {
        this.revealed = true
        this.render()
      })
    }
  }

  private renderRevealButton(): string {
    return `
      <button class="reveal-button">
        <span class="reveal-text">Reveal Lock Combination</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </button>
    `
  }

  private renderCombo(): string {
    const combo = decrypt(ENCRYPTED_COMBO)
    const parts = combo.split(', ')

    return `
      <div class="combo-display">
        <div class="combo-numbers">
          ${parts.map((num, i) => `
            <div class="combo-number" style="animation-delay: ${i * 0.2}s">
              <span class="number-value">${num}</span>
            </div>
            ${i < parts.length - 1 ? '<span class="combo-separator">-</span>' : ''}
          `).join('')}
        </div>
      </div>
    `
  }
}
