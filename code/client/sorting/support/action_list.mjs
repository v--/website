import { separate, swap } from '../../../common/support/iteration'

export default class ActionList {
  constructor (array) {
    this.originalArray = array
    this.array = Array.from(array)
    this.separatedArray = separate(array)
    this.actions = [null]
  }

  get n () {
    return this.array.length
  }

  get (i) {
    return this.separatedArray[i]
  }

  swap (i, j) {
    if (i !== j) {
      swap(this.array, i, j)
      swap(this.separatedArray, i, j)
    }

    this.actions.push({
      i,
      j,
      swapped: i !== j
    })
  }

  tint (i, j) {
    this.actions.push({
      i,
      j,
      swapped: false
    })
  }

  finish () {
    this.actions.push(null)
  }
}
