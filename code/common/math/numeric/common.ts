import { DimensionMismatchError } from './errors.ts'
import { zip } from '../../support/iteration.ts'
import { type float64 } from '../../types/numbers.ts'

export function sum(values: float64[]): float64 {
  return values.reduce((accum, value) => value + accum, 0)
}

export function dotprod(x: float64[], y: float64[]): float64 {
  if (x.length !== y.length) {
    throw new DimensionMismatchError('The dot product is only defined for vectors of the same dimension')
  }

  // TODO: Remove Array.from once Iterator.prototype.reduce() proliferates
  return Array.from(zip(x, y)).reduce((accum, [a, b]) => accum + a * b, 0)
}
