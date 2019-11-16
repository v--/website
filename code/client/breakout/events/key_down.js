import { GameStatus } from '../enums/game_status.js'
import { DEFAULT_GAME_STATE } from '../game_state.js'

export function onKeyDown (subject, key) {
  const { eventLoop } = subject.value

  switch (key) {
    case ' ':
      switch (subject.value.status) {
        case GameStatus.GAME_OVER:
        case GameStatus.COMPLETED:
          subject.update(DEFAULT_GAME_STATE)

        case GameStatus.UNSTARTED: // eslint-disable-line no-fallthrough
        case GameStatus.PAUSED:
          subject.update({ status: GameStatus.RUNNING })
          eventLoop.start()
          break

        case GameStatus.RUNNING:
          subject.update({ status: GameStatus.PAUSED })
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
