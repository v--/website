import { swap } from '../../../common/support/iteration.js'
import { SortAction } from './types/action.js'

export interface ActionListParams {
  array: float64[]
  actions?: (SortAction | undefined)[]
}

export interface ActionList extends Required<ActionListParams> {}
export class ActionList {
  private originalArray: float64[]

  constructor({ array, actions = [] }: ActionListParams) {
    this.originalArray = array
    this.array = array.slice()
    this.actions = actions
  }

  get length() {
    return this.array.length
  }

  get(i: uint32) {
    return this.array[i]
  }

  update(i: uint32, j: uint32, swapped: boolean) {
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
