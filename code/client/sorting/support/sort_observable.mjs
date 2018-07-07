import { map, sum, swap } from '../../../common/support/iteration'
import { Observable } from '../../../common/support/observable'
import ActionList from './action_list'

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
  return actionLists.map(function (list, i) {
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

export default class SortObservable extends Observable {
  constructor (algorithm, sequences) {
    const actionLists = constructActionLists(algorithm, sequences)

    super(
      {
        states: getStatesAtIndex(actionLists, 0),
        sort: () => {
          this.sort()
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

  _calculateMaxActionListIndex () {
    this._maxActionListIndex = Math.max.apply(null, this._actionLists.map(list => list.actions.length)) - 1
  }

  reset () {
    window.clearInterval(this._interval)
    this._actionLists = constructActionLists(this.algorithm, this.sequences)
    this._actionListIndex = 0
    this._calculateMaxActionListIndex()

    this.update({
      states: getStatesAtIndex(this._actionLists, this._actionListIndex)
    })
  }

  advance () {
    if (this._actionListIndex === this._maxActionListIndex) {
      return false
    }

    this._actionListIndex += 1
    this.update({
      states: getStatesAtIndex(this._actionLists, this._actionListIndex)
    })

    return true
  }

  sort () {
    this.reset()
    this.advance()
    this._interval = window.setInterval(() => {
      if (!this.advance()) {
        window.clearInterval(this._interval)
      }
    }, SORT_INTERVAL)
  }
}
