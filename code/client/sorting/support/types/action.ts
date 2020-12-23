import { uint32 } from '../../../../common/types/numeric.js'

export interface SortAction {
  i: uint32
  j: uint32
  swapped: boolean
}
