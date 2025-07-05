import { EmptyIterError } from './errors.ts'
import { type float64 } from '../../types/numbers.ts'
import { type Mapper } from '../../types/typecons.ts'

export function first<T>(iterable: Iterable<T>): T {
  const iter = iterable[Symbol.iterator]()
  const state = iter.next()

  if (state.done) {
    throw new EmptyIterError('Cannot get the first element of an empty iterable')
  }

  return state.value
}

export function last<T>(iterable: Iterable<T>): T {
  const iter = iterable[Symbol.iterator]()
  let newState = iter.next()

  if (newState.done) {
    throw new EmptyIterError('Cannot get the last element of an empty iterable')
  }

  let state = newState

  while (!newState.done) {
    state = newState
    newState = iter.next()
  }

  return state.value
}

export function schwartzMax<T>(transform: Mapper<T, float64>, iterable: Iterable<T>): T {
  // eslint-disable-next-line @typescript-eslint/no-restricted-types
  return schwartzMin(x => -(transform(x) as number), iterable)
}

export function schwartzMin<T, R = undefined>(transform: Mapper<T, float64>, iterable: Iterable<T>, defaultValue?: R): T | R {
  const iter = iterable[Symbol.iterator]()
  let { value: x, done } = iter.next()

  if (done) {
    return defaultValue as R
  }

  let minX = x
  let minValue = transform(x)

  for (; !done; { value: x, done } = iter.next()) {
    const value = transform(x)

    if (value < minValue) {
      minX = x
      minValue = value
    }
  }

  return minX
}
