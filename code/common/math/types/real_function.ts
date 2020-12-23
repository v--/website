import { float64 } from '../../types/numeric.js'

export interface IRealFunction {
  eval(x: float64): float64
  toString(): string
}
