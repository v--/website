import { EmptyIterError, sort } from '../../support/iteration.ts'
import { type float64 } from '../../types/numbers.ts'

export function median(iter: Iterable<float64>): float64 {
  const ordered = sort(iter)

  if (ordered.length === 0) {
    throw new EmptyIterError('Cannot find the median of an empty collection')
  }

  if (ordered.length === 1) {
    return ordered[0]
  }

  const midpointIndex = ordered.length / 2

  if (Number.isInteger(midpointIndex)) {
    return ordered[midpointIndex]
  } else {
    return (ordered[Math.floor(midpointIndex)] + ordered[Math.ceil(midpointIndex)]) / 2
  }
}
