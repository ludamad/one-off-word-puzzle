export class Intro {
  private container: HTMLElement
  private onStart: () => void

  constructor(container: HTMLElement, onStart: () => void) {
    this.container = container
    this.onStart = onStart
  }

  render(): void {
    this.container.innerHTML = `
      <div class="intro-screen">
        <div class="intro-content">
          <div class="intro-decoration">✨</div>
          <h1 class="intro-title">Merry Christmas</h1>
          <h2 class="intro-name">Martyna!</h2>
          <div class="intro-decoration">🎄</div>

          <div class="intro-message">
            <p>Your gift is locked away in a special box...</p>
            <p>To get the <strong>lock combination</strong>, you'll need to solve a series of word puzzles!</p>
          </div>

          <div class="intro-challenges">
            <div class="challenge-item">
              <span class="challenge-icon">🔍</span>
              <span>3 Find Words puzzles</span>
            </div>
            <div class="challenge-item">
              <span class="challenge-icon">📝</span>
              <span>2 Crosswords</span>
            </div>
            <div class="challenge-item">
              <span class="challenge-icon">🔤</span>
              <span>5 Rearrange puzzles</span>
            </div>
          </div>

          <p class="intro-hint">Complete them all to reveal the combination!</p>

          <button class="intro-start-btn">Let's Play!</button>
        </div>
      </div>
    `

    this.container.querySelector('.intro-start-btn')?.addEventListener('click', () => {
      this.onStart()
    })
  }
}
