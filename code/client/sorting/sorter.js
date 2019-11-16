import { CoolError } from '../../common/errors.js'
import { swap } from '../../common/support/iteration.js'
import { DictSubject } from '../../common/observables/dict_subject.js'

import { createIntervalObservable } from '../core/support/timeout.js'
import { ActionList } from './support/action_list.js'

class SorterError extends CoolError {}

const SORT_INTERVAL = 25

function constructActionLists (algorithm, sequences) {
  return sequences.map(function (sequence) {
    const actionList = new ActionList(sequence.constructArray())
    algorithm.implementation(actionList)
    actionList.finish()

    return {
      sequence,
      currentState: Array.from(actionList.originalArray),
      actions: actionList.actions
    }
  })
}

function getStatesAtIndex (actionLists, index) {
  return actionLists.map(function (list) {
    const action = list.actions[Math.min(index, list.actions.length - 1)]

    if (index < list.actions.length && action && action.swapped) {
      swap(list.currentState, action.i, action.j)
    }

    return {
      lastAction: action,
      sequence: list.sequence,
      state: list.currentState
    }
  })
}

export class Sorter {
  constructor (algorithm, sequences) {
    const actionLists = constructActionLists(algorithm, sequences)

    this.state$ = new DictSubject({
      states: getStatesAtIndex(actionLists, 0),
      algorithm: algorithm,
      isRunning: false,
      hasFinished: false,
      run: () => {
        this.run()
      },
      pause: () => {
        this.pause()
      },
      reset: () => {
        this.reset()
      }
    })

    this.algorithm = algorithm
    this.sequences = sequences

    this._actionLists = actionLists
    this._actionListIndex = 0
    this._intervalObservable = createIntervalObservable(SORT_INTERVAL)
    this._intervalSubscription = null
    this._calculateMaxActionListIndex()
  }

  _calculateMaxActionListIndex () {
    this._maxActionListIndex = Math.max(...this._actionLists.map(list => list.actions.length)) - 1
  }

  reset () {
    this.pause()
    this._actionLists = constructActionLists(this.algorithm, this.sequences)
    this._actionListIndex = 0
    this._calculateMaxActionListIndex()

    this.state$.update({
      states: getStatesAtIndex(this._actionLists, this._actionListIndex),
      hasFinished: false
    })
  }

  pause () {
    if (this._intervalSubscription) {
      this._intervalSubscription.unsubscribe()
    }

    this._intervalSubscription = null

    this.state$.update({
      isRunning: false
    })
  }

  run () {
    if (this.state$.value.hasFinished || this.state$.value.isRunning) {
      return
    }

    this.advance()
    this.state$.update({
      isRunning: true
    })

    if (this._intervalSubscription !== null) {
      throw new SorterError('Cannot run a sorting simulation while the previous one has not finished')
    }

    this._intervalSubscription = this._intervalObservable.subscribe(function () {
      this.advance()

      if (this.state$.value.hasFinished) {
        this.pause()
      }
    }.bind(this))
  }

  advance () {
    if (this.state$.value.hasFinished) {
      return
    }

    this._actionListIndex += 1
    this.state$.update({
      states: getStatesAtIndex(this._actionLists, this._actionListIndex),
      hasFinished: this._actionListIndex === this._maxActionListIndex
    })
  }
}
