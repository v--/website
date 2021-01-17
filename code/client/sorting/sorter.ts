import { CoolError } from '../../common/errors.js'
import { swap } from '../../common/support/iteration.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { createIntervalObservable } from '../core/support/timeout.js'
import { ActionList } from './support/action_list.js'
import { Sequence } from './types/sequences.js'
import { SortAlgorithm } from './types/sort_algorithm.js'
import { SortAction } from './support/types/action.js'
import { SorterComponentState, SorterState } from './types/sorter.js'

class SorterError extends CoolError {}

const SORT_INTERVAL = 25

interface ActionListCollection {
  sequence: Sequence,
  currentState: float64[],
  actions: (SortAction | undefined)[]
}

function constructActionListCollections(algorithm: SortAlgorithm, sequences: Sequence[]) {
  return sequences.map(function(sequence) {
    const actionList = new ActionList({
      array: sequence.constructArray(),
      actions: [undefined]
    })
    algorithm.implementation(actionList)
    actionList.finish()

    return {
      sequence,
      currentState: actionList.cloneOriginalArray(),
      actions: actionList.actions
    }
  })
}

function getStatesAtIndex(actionListCollections: ActionListCollection[], index: uint32): SorterState[] {
  return actionListCollections.map(function({ currentState, sequence, actions }) {
    const action = actions[Math.min(index, actions.length - 1)]

    if (index < actions.length && action && action.swapped) {
      swap(currentState, action.i, action.j)
    }

    return {
      lastAction: action,
      sequence,
      state: currentState
    }
  })
}

export interface SorterParams {
  algorithm: SortAlgorithm
  sequences: Sequence[]
  state$: DictSubject<SorterComponentState>
  actionListCollections: ActionListCollection[]
  actionListIndex: uint32
  maxActionListIndex: uint32
}

export interface Sorter extends SorterParams {
  intervalObservable: Observables.IObservable<void>
  intervalSubscription?: Observables.ISubscription
}

export class Sorter {
  static build(algorithm: SortAlgorithm, sequences: Sequence[]) {
    const actionListCollections = constructActionListCollections(algorithm, sequences)
    const state$ = new DictSubject({
      states: getStatesAtIndex(actionListCollections, 0),
      algorithm,
      isRunning: false,
      hasFinished: false,
      run: () => {
        sorter.run()
      },
      pause: () => {
        sorter.pause()
      },
      reset: () => {
        sorter.reset()
      }
    })

    const sorter = new Sorter({
      algorithm,
      sequences,
      actionListCollections,
      actionListIndex: 0,
      maxActionListIndex: Math.max(...actionListCollections.map(list => list.actions.length)) - 1,
      state$
    })

    return sorter
  }

  constructor(params: SorterParams) {
    Object.assign(this, params)
    this.intervalObservable = createIntervalObservable(SORT_INTERVAL)
  }

  reset() {
    this.pause()
    this.actionListCollections = constructActionListCollections(this.algorithm, this.sequences)
    this.actionListIndex = 0
    this.maxActionListIndex = Math.max(...this.actionListCollections.map(list => list.actions.length)) - 1

    this.state$.update({
      states: getStatesAtIndex(this.actionListCollections, this.actionListIndex),
      hasFinished: false
    })
  }

  pause() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe()
      this.intervalSubscription = undefined
    }

    this.state$.update({
      isRunning: false
    })
  }

  run() {
    if (this.state$.value.hasFinished || this.state$.value.isRunning) {
      return
    }

    this.advance()
    this.state$.update({
      isRunning: true
    })

    if (this.intervalSubscription) {
      throw new SorterError('Cannot run a sorting simulation while the previous one has not finished')
    }

    this.intervalSubscription = this.intervalObservable.subscribe(() => {
      this.advance()

      if (this.state$.value.hasFinished) {
        this.pause()
      }
    })
  }

  advance() {
    if (this.state$.value.hasFinished) {
      return
    }

    this.actionListIndex += 1
    this.state$.update({
      states: getStatesAtIndex(this.actionListCollections, this.actionListIndex),
      hasFinished: this.actionListIndex === this.maxActionListIndex
    })
  }
}
