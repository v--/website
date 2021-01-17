import { SortAction } from '../support/types/action.js'
import { Sequence } from './sequences.js'
import { SortAlgorithm } from './sort_algorithm.js'

export interface SorterComponentState {
  states: SorterState[],
  algorithm: SortAlgorithm,
  isRunning: boolean,
  hasFinished: boolean,
  run: TypeCons.Action<void>,
  pause: TypeCons.Action<void>,
  reset: TypeCons.Action<void>
}

export interface SorterState {
  lastAction?: SortAction,
  sequence: Sequence,
  state: Num.Float64[]
}
