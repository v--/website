import { type float64, type uint32 } from '../../types/numbers.ts'
import { MathError } from '../errors.ts'

export function randFloat(a: float64, b: float64): float64 {
  return a + Math.random() * (b - a)
}

export function randInt(a: uint32, b: uint32): uint32 {
  return Math.floor(randFloat(a, b))
}

export function choice<T>(collection: T[]): T {
  if (collection.length === 0) {
    throw new MathError('Cannot choose an element from an empty collection')
  }

  return collection[randInt(0, collection.length)]
}
