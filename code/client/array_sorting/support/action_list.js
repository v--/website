import { swap } from '../../../common/support/iteration.js'

/**
 * @implements {TArraySorting.IActionList}
 */
export class ActionList {
  /** @param {TArraySorting.IActionListParams} params */
  constructor({ array, actions = [] }) {
    this.originalArray = array
    this.array = array.slice()
    this.actions = actions
  }

  get length() {
    return this.array.length
  }

  /** @param {TNum.UInt32} i */
  get(i) {
    return this.array[i]
  }

  /**
   * @param {TNum.UInt32} i
   * @param {TNum.UInt32} j
   * @param {boolean} swapped
   */
  update(i, j, swapped) {
    if (swapped) {
      swap(this.array, i, j)
    }

    this.actions.push({ i, j, swapped })
  }

  finish() {
    this.actions.push(undefined)
  }

  cloneOriginalArray() {
    return this.originalArray.slice()
  }
}
