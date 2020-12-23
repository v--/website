import { DictSubject } from '../../../common/observables/dict_subject.js'
import { IGameState } from '../game_state.js'

export function onKeyUp(subject$: DictSubject<IGameState>, key: string) {
  const { paddleDirection } = subject$.value

  if (key === 'ArrowLeft' && paddleDirection < 0) {
    subject$.update({ paddleDirection: 0 })
  }

  if (key === 'ArrowRight' && paddleDirection > 0) {
    subject$.update({ paddleDirection: 0 })
  }
}
