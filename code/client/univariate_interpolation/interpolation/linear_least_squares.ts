import { UnivariatePolynomial, ZERO_POLYNOMIAL } from '../../../common/math/algebra/univariate_polynomial.ts'
import { type KnotMapping, dotprod, sum } from '../../../common/math/numeric.ts'
import { type IInterpolator } from '../types.ts'

export const LINEAR_LEAST_SQUARES_INTERPOLATOR: IInterpolator = {
  id: 'linear_least_squares',
  implementationDate: '2018-09-06',
  visibleByDefault: false,
  interpolate(knots: KnotMapping): UnivariatePolynomial {
    const n = knots.getNodeCount()
    const x = Array.from(knots.iterX())
    const y = Array.from(knots.iterY())

    if (n === 0) {
      return ZERO_POLYNOMIAL
    }

    if (n === 1) {
      return UnivariatePolynomial.safeCreate(y)
    }

    const sx = sum(x)
    const sy = sum(y)

    const b = (n * dotprod(x, y) - sx * sy) / (n * dotprod(x, x) - sx * sx)
    const a = (sy - b * sx) / n

    return UnivariatePolynomial.safeCreate([a, b])
  },
}
