import { DimensionMismatchError } from './errors.ts'
import { reduce, zip } from '../../support/iteration.ts'
import { type float64 } from '../../types/numbers.ts'

export function sum(values: float64[]): float64 {
  return reduce((accum, value) => value + accum, values, 0)
}

export function dotprod(x: float64[], y: float64[]): float64 {
  if (x.length !== y.length) {
    throw new DimensionMismatchError('The dot product is only defined for vectors of the same dimension')
  }

  return reduce((accum, [a, b]) => accum + a * b, zip(x, y), 0)
}
