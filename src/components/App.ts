import type { GameState, GameType } from '../state/gameState'
import { loadState, isAllComplete, completeRound, saveState } from '../state/gameState'
import { ProgressTracker } from './ProgressTracker'
import { Navigation } from './Navigation'
import { FindWordsGame } from '../games/findWords/FindWordsGame'
import { CrosswordGame } from '../games/crossword/CrosswordGame'
import { RearrangeGame } from '../games/rearrange/RearrangeGame'
import { Victory } from './Victory'
import { Intro } from './Intro'

export class App {
  private container: HTMLElement
  private state: GameState
  private progressTracker: ProgressTracker | null = null
  private navigation: Navigation | null = null

  constructor(container: HTMLElement) {
    this.container = container
    this.state = loadState()
  }

  mount(): void {
    this.render()
  }

  private render(): void {
    // Check if all puzzles complete
    if (isAllComplete(this.state)) {
      this.state.currentView = 'victory'
    }

    // Don't show header/progress during intro, game or victory
    if (this.state.currentView === 'intro' || this.state.currentView === 'game' || this.state.currentView === 'victory') {
      this.container.innerHTML = '<main id="main-content"></main>'
    } else {
      this.container.innerHTML = `
        <header class="app-header">
          <h1 class="app-title">Word Puzzles</h1>
          <p class="app-subtitle">A gift for Martyna</p>
        </header>
        <div id="progress-container"></div>
        <main id="main-content"></main>
      `

      const progressContainer = this.container.querySelector('#progress-container') as HTMLElement
      this.progressTracker = new ProgressTracker(progressContainer, this.state)
      this.progressTracker.render()
    }

    const mainContent = this.container.querySelector('#main-content') as HTMLElement
    this.renderView(mainContent)
  }

  private renderView(container: HTMLElement): void {
    switch (this.state.currentView) {
      case 'intro':
        this.renderIntro(container)
        break
      case 'menu':
        this.renderMenu(container)
        break
      case 'game':
        this.renderGame(container)
        break
      case 'victory':
        this.renderVictory(container)
        break
    }
  }

  private renderIntro(container: HTMLElement): void {
    const intro = new Intro(container, () => {
      this.state = {
        ...this.state,
        seenIntro: true,
        currentView: 'menu',
      }
      saveState(this.state)
      this.render()
    })
    intro.render()
  }

  private renderMenu(container: HTMLElement): void {
    this.navigation = new Navigation(container, this.state, (gameType, round) => {
      this.startGame(gameType, round)
    })
    this.navigation.render()
  }

  private renderGame(container: HTMLElement): void {
    const { currentGame, currentRound } = this.state

    switch (currentGame) {
      case 'findWords':
        this.renderFindWordsGame(container, currentRound)
        break
      case 'crossword':
        this.renderCrosswordGame(container, currentRound)
        break
      case 'rearrange':
        this.renderRearrangeGame(container, currentRound)
        break
    }
  }

  private renderFindWordsGame(container: HTMLElement, round: number): void {
    const savedWords = this.state.findWords[round].foundWords
    new FindWordsGame(
      container,
      round,
      savedWords,
      (foundWords) => {
        this.state = completeRound(this.state, 'findWords', round, { foundWords })
        this.backToMenu()
      },
      () => this.backToMenu()
    )
  }

  private renderCrosswordGame(container: HTMLElement, round: number): void {
    const savedAnswers = this.state.crossword[round].answers
    new CrosswordGame(
      container,
      round,
      savedAnswers,
      (answers) => {
        this.state = completeRound(this.state, 'crossword', round, { answers })
        this.backToMenu()
      },
      () => this.backToMenu()
    )
  }

  private renderRearrangeGame(container: HTMLElement, round: number): void {
    const savedWords = this.state.rearrange[round].foundWords
    new RearrangeGame(
      container,
      round,
      savedWords,
      (foundWords) => {
        this.state = completeRound(this.state, 'rearrange', round, { foundWords })
        this.backToMenu()
      },
      () => this.backToMenu()
    )
  }

  private renderVictory(container: HTMLElement): void {
    const victory = new Victory(container)
    victory.render()
  }

  private startGame(gameType: GameType, round: number): void {
    this.state = {
      ...this.state,
      currentView: 'game',
      currentGame: gameType,
      currentRound: round,
    }
    this.render()
  }

  private backToMenu(): void {
    this.state = {
      ...this.state,
      currentView: 'menu',
      currentGame: null,
      currentRound: 0,
    }
    this.render()
  }
}
