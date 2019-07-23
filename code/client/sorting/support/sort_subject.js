import { CoolError } from '../../../common/errors.js'
import { swap } from '../../../common/support/iteration.js'
import DictSubject from '../../../common/observables/dict_subject.js'

import ActionList from './action_list.js'

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

export default class SortSubject extends DictSubject {
  constructor (algorithm, sequences) {
    const actionLists = constructActionLists(algorithm, sequences)

    super(
      {
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
      }
    )

    this.algorithm = algorithm
    this.sequences = sequences
    this._actionLists = actionLists
    this._actionListIndex = 0
    this._interval = null
    this._calculateMaxActionListIndex()
  }

  get hasFinished () {
    return this._actionListIndex === this._maxActionListIndex
  }

  _calculateMaxActionListIndex () {
    this._maxActionListIndex = Math.max.apply(null, this._actionLists.map(list => list.actions.length)) - 1
  }

  reset () {
    this.pause()
    this._actionLists = constructActionLists(this.algorithm, this.sequences)
    this._actionListIndex = 0
    this._calculateMaxActionListIndex()

    this.update({
      states: getStatesAtIndex(this._actionLists, this._actionListIndex),
      hasFinished: false
    })
  }

  pause () {
    window.clearInterval(this._interval)
    this._interval = null

    this.update({
      isRunning: false
    })
  }

  run () {
    if (this.hasFinished || this.value.isRunning) {
      return
    }

    this.advance()
    this.update({
      isRunning: true
    })

    if (this._interval !== null) {
      throw new CoolError('Tried to run a sorting simulation while the previous one has not finished')
    }

    this._interval = window.setInterval(() => {
      this.advance()

      if (this.hasFinished) {
        this.pause()
      }
    }, SORT_INTERVAL)
  }

  advance () {
    if (this.hasFinished) {
      return
    }

    this._actionListIndex += 1
    this.update({
      states: getStatesAtIndex(this._actionLists, this._actionListIndex),
      hasFinished: this.hasFinished
    })
  }
}
