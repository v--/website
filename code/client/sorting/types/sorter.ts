import { SortAction } from '../support/types/action.js'
import { Sequence } from './sequences.js'
import { SortAlgorithm } from './sort_algorithm.js'

export interface SorterComponentState {
  states: SorterState[],
  algorithm: SortAlgorithm,
  isRunning: boolean,
  hasFinished: boolean,
  run: TCons.Action<void>,
  pause: TCons.Action<void>,
  reset: TCons.Action<void>
}

export interface SorterState {
  lastAction?: SortAction,
  sequence: Sequence,
  state: TNum.Float64[]
}
