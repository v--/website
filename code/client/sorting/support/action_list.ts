import { swap } from '../../../common/support/iteration.js'
import { SortAction } from './types/action.js'

export interface ActionListParams {
  array: TNum.Float64[]
  actions?: (SortAction | undefined)[]
}

export interface ActionList extends Required<ActionListParams> {}
export class ActionList {
  private originalArray: TNum.Float64[]

  constructor({ array, actions = [] }: ActionListParams) {
    this.originalArray = array
    this.array = array.slice()
    this.actions = actions
  }

  get length() {
    return this.array.length
  }

  get(i: TNum.UInt32) {
    return this.array[i]
  }

  update(i: TNum.UInt32, j: TNum.UInt32, swapped: boolean) {
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
