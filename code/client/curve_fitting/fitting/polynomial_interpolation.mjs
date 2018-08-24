import { repr } from '../../../common/support/strings'
import { NoPointsError } from '../errors'

import Polynomial from '../support/polynomial'
import dividedDifferences from '../support/divided_differences'

// Newton's formula for interpolation with algebraic polynomials
export default function polynomialInterpolation (f, points) {
  if (points.length === 0) {
    throw new NoPointsError(`Cannot interpolate ${repr(f)} at zero points`)
  }

  let result = new Polynomial([f(points[0])])

  for (let k = 1; k < points.length; k++) {
    let current = new Polynomial([dividedDifferences(f, points.slice(0, k + 1))])

    for (let i = 0; i <= k - 1; i++) {
      current = current.multiply(new Polynomial([1, -points[i]]))
    }

    result = result.add(current)
  }

  return result
}
