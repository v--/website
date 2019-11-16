import { separate, swap } from '../../../common/support/iteration.js'

export class ActionList {
  constructor (array) {
    this.originalArray = array
    this.array = Array.from(array)
    this.separatedArray = separate(array)
    this.actions = [null]
  }

  get length () {
    return this.array.length
  }

  indexOf (value) {
    return this.separatedArray.indexOf(value)
  }

  get (i) {
    return this.separatedArray[i]
  }

  update (i, j, swapped) {
    if (swapped) {
      swap(this.array, i, j)
      swap(this.separatedArray, i, j)
    }

    this.actions.push({ i, j, swapped })
  }

  finish () {
    this.actions.push(null)
  }
}
