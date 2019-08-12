import GameState from '../enums/game_state.js'
import { DEFAULT_GAME_STATE } from '../constants.js'

export default function onKeyDown (subject, key) {
  const { eventLoop } = subject.value

  switch (key) {
    case ' ':
      switch (subject.value.state) {
        case GameState.GAME_OVER:
        case GameState.COMPLETED:
          subject.update(DEFAULT_GAME_STATE)

        case GameState.UNSTARTED: // eslint-disable-line no-fallthrough
        case GameState.PAUSED:
          subject.update({ state: GameState.RUNNING })
          eventLoop.start()
          break

        case GameState.RUNNING:
          subject.update({ state: GameState.PAUSED })
          eventLoop.stop()
          break
      }

      break

    case 'ArrowLeft':
      subject.update({ paddleDirection: -1 })
      break

    case 'ArrowRight':
      subject.update({ paddleDirection: 1 })
      break
  }
}
