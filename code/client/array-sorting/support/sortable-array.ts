import { swap } from '../../../common/support/iteration.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { type ISortingComparison } from '../types.ts'

/**
 * A wrapper around the array class that can only be mutated via sort comparisons.
 * The comparisons are recorded during sorting and are available after that.
 */
export class SortableArray {
  #array: uint32[]
  readonly comparisons: ISortingComparison[] = []

  constructor(initialArray: uint32[]) {
    this.#array = initialArray.slice()
  }

  getLength() {
    return this.#array.length
  }

  get(i: uint32) {
    return this.#array[i]
  }

  recordComparison(i: uint32, j: uint32, swapped: boolean) {
    if (swapped) {
      swap(this.#array, i, j)
    }

    this.comparisons.push({ i, j, swapped })
  }
}
