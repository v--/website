import { float64 } from '../../../common/types/numeric.js'

export interface Sequence {
  name: string,
  constructArray(): float64[]
}
