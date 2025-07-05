import { type KnotMapping, constructNewtonUnivariatePolynomial } from '../../../common/math/numeric.ts'
import { type IInterpolator } from '../types.ts'

export const NEWTON_POLYNOMIAL_INTERPOLATOR: IInterpolator = {
  id: 'newton_polynomial',
  implementationDate: '2018-22-07',
  visibleByDefault: true,
  interpolate(knots: KnotMapping) {
    return constructNewtonUnivariatePolynomial(knots)
  },
}
