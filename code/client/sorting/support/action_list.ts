import { swap } from '../../../common/support/iteration.js'
import { SortAction } from './types/action.js'

export interface ActionListParams {
  array: Num.Float64[]
  actions?: (SortAction | undefined)[]
}

export interface ActionList extends Required<ActionListParams> {}
export class ActionList {
  private originalArray: Num.Float64[]

  constructor({ array, actions = [] }: ActionListParams) {
    this.originalArray = array
    this.array = array.slice()
    this.actions = actions
  }

  get length() {
    return this.array.length
  }

  get(i: Num.UInt32) {
    return this.array[i]
  }

  update(i: Num.UInt32, j: Num.UInt32, swapped: boolean) {
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
