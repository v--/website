import { type KnotMapping, splineFromKnots } from '../../../common/math/numeric.ts'
import { type IInterpolator } from '../types.ts'

export const QUADRATIC_SPLINE_INTERPOLATOR: IInterpolator = {
  id: 'quadratic_spline',
  implementationDate: '2018-09-10',
  visibleByDefault: true,
  interpolate(knots: KnotMapping) {
    return splineFromKnots(2, knots)
  },
}
