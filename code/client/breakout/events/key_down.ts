import { DictSubject } from '../../../common/observables/dict_subject.js'
import { GameStatus } from '../enums/game_status.js'
import { DEFAULT_GAME_STATE, IGameState } from '../game_state.js'

export function onKeyDown(subject$: DictSubject<IGameState>, key: string) {
  const { eventLoop } = subject$.value

  switch (key) {
    case ' ':
      switch (subject$.value.status) {
        case GameStatus.gameOver:
        case GameStatus.completed:
          subject$.update(DEFAULT_GAME_STATE)

        case GameStatus.unstarted: // eslint-disable-line no-fallthrough
        case GameStatus.paused:
          subject$.update({ status: GameStatus.running })
          eventLoop.start()
          break

        case GameStatus.running:
          subject$.update({ status: GameStatus.paused })
          eventLoop.stop()
          break
      }

      break

    case 'ArrowLeft':
      subject$.update({ paddleDirection: -1 })
      break

    case 'ArrowRight':
      subject$.update({ paddleDirection: 1 })
      break
  }
}
