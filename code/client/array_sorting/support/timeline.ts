import { swap } from '../../../common/support/iteration.ts'
import { type uint32 } from '../../../common/types/numbers.ts'
import { type ISortingComparison, type ISortingTimelineSnapshot } from '../types.ts'

export class SortingTimeline {
  readonly initialArray: uint32[]
  readonly comparisons: ISortingComparison[]

  constructor(initialArray: uint32[], comparisons: ISortingComparison[]) {
    this.initialArray = initialArray
    this.comparisons = comparisons
  }

  isComplete(moment: uint32) {
    return this.comparisons.length < moment
  }

  getSnapshot(moment: uint32): ISortingTimelineSnapshot {
    const array = this.initialArray.slice()

    for (let t = 1; t <= Math.min(moment, this.comparisons.length); t++) {
      const action = this.comparisons[t - 1]

      if (action.swapped) {
        swap(array, action.i, action.j)
      }
    }

    return {
      array,
      action: this.comparisons[moment - 1],
    }
  }
}
