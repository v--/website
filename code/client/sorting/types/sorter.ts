import { Action } from '../../../common/types/typecons.js'
import { float64 } from '../../../common/types/numeric.js'
import { SortAction } from '../support/types/action.js'
import { Sequence } from './sequences.js'
import { SortAlgorithm } from './sort_algorithm.js'

export interface SorterComponentState {
  states: SorterState[],
  algorithm: SortAlgorithm,
  isRunning: boolean,
  hasFinished: boolean,
  run: Action<void>,
  pause: Action<void>,
  reset: Action<void>
}

export interface SorterState {
  lastAction?: SortAction,
  sequence: Sequence,
  state: float64[]
}
