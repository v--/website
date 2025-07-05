import { KnotExistenceError, KnotUniquenessError } from './errors.ts'
import { repr } from '../../support/strings.ts'
import { type float64 } from '../../types/numbers.ts'

export function dividedDifferences(f: (x: float64) => float64, points: float64[]): float64 {
  const n = points.length

  switch (n) {
    case 0:
      throw new KnotExistenceError(`Expected at least one point for computing divided differences for ${repr(f)}.`)

    case 1:
      return f(points[0])

    default:
    {
      const first = points[0]
      const last = points[n - 1]

      if (first === last) {
        throw new KnotUniquenessError('Computing the divided differences of repeated points is not supported.')
      }

      const forward = dividedDifferences(f, points.slice(1))
      const backward = dividedDifferences(f, points.slice(0, n - 1))
      return (forward - backward) / (last - first)
    }
  }
}
