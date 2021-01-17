import { float64 } from '../../types/numeric'

export interface IRealFunction {
  eval(x: float64): float64
  toString(): string
}
