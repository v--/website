import { CoolError } from '../../errors.js'
import { repr } from '../../support/strings.js'

export class DividedDifferencesError extends CoolError {}
export class NoPointsError extends DividedDifferencesError {}
export class DuplicatePointsError extends DividedDifferencesError {}

export function dividedDifferences (f, points) {
  const n = points.length

  switch (n) {
    case 0:
      throw new NoPointsError(`Trying to compute the divided differences for ${repr(f)} at zero points.`)

    case 1:
      return f(points[0])

    default:
      const first = points[0]
      const last = points[n - 1]

      if (first === last) {
        throw new DuplicatePointsError(`Computing the divided differences of repeated points is not supported.`)
      }

      const forward = dividedDifferences(f, points.slice(1))
      const backward = dividedDifferences(f, points.slice(0, n - 1))
      return (forward - backward) / (last - first)
  }
}
