import { swap } from '../../../common/support/iteration.js'

export class ActionList {
  constructor (array) {
    this._originalArray = array
    this._array = this.cloneOriginalArray()
    this.actions = [null]
  }

  get length () {
    return this._array.length
  }

  get (i) {
    return this._array[i]
  }

  update (i, j, swapped) {
    if (swapped) {
      swap(this._array, i, j)
    }

    this.actions.push({ i, j, swapped })
  }

  finish () {
    this.actions.push(null)
  }

  cloneOriginalArray () {
    return Array.from(this._originalArray)
  }
}
