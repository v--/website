import { DictSubject } from '../../../common/observables/dict_subject.js'
import { DEFAULT_GAME_STATE, IGameState } from '../game_state.js'

/**
 * @param {DictSubject<IGameState>} subject$
 * @param {string} key
 */
export function onKeyDown(subject$, key) {
  const { eventLoop } = subject$.value

  switch (key) {
    case ' ':
      switch (subject$.value.status) {
        case 'gameOver':
        case 'completed':
          subject$.update(DEFAULT_GAME_STATE)

        case 'unstarted': // eslint-disable-line no-fallthrough
        case 'paused':
          subject$.update({ status: 'running' })
          eventLoop.start()
          break

        case 'running':
          subject$.update({ status: 'paused' })
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
