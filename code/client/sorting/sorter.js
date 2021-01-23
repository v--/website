import { CoolError } from '../../common/errors.js'
import { swap } from '../../common/support/iteration.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { createIntervalObservable } from '../core/support/timeout.js'
import { ActionList } from './support/action_list.js'

class SorterError extends CoolError {}

const SORT_INTERVAL = 25

/**
 * @param {TSortVis.ISortAlgorithm} algorithm
 * @param {readonly TSortVis.ISequence[]} sequences
 */
function constructActionListCollections(algorithm, sequences) {
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

/**
 * @param {TSortVis.IActionListCollection[]} actionListCollections
 * @param {TNum.UInt32} index
 * @returns {TSortVis.ISorterState[]}
 */
function getStatesAtIndex(actionListCollections, index) {
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

/**
 * @implements {TSortVis.ISorter} Sorter
 */
export class Sorter {
  /**
   * @param {TSortVis.ISortAlgorithm} algorithm
   * @param {readonly TSortVis.ISequence[]} sequences
   */
  static build(algorithm, sequences) {
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

  /** @param {TSortVis.ISorterParams} params */
  constructor({ algorithm, sequences, state$, actionListCollections, actionListIndex, maxActionListIndex }) {
    this.algorithm = algorithm
    this.sequences = sequences
    this.state$ = state$
    this.actionListCollections = actionListCollections
    this.actionListIndex = actionListIndex
    this.maxActionListIndex = maxActionListIndex
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
