import { DictSubject } from '../../../common/observables/dict_subject.js'

/**
 * @param {DictSubject<TBreakout.IGameState>} subject$
 * @param {string} key
 */
export function onKeyUp(subject$, key) {
  const { paddleDirection } = subject$.value

  if (key === 'ArrowLeft' && paddleDirection < 0) {
    subject$.update({ paddleDirection: 0 })
  }

  if (key === 'ArrowRight' && paddleDirection > 0) {
    subject$.update({ paddleDirection: 0 })
  }
}
