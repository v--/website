import { type KnotMapping, splineFromKnots } from '../../../common/math/numeric.ts'
import { type IInterpolator } from '../types.ts'

export const LINEAR_SPLINE_INTERPOLATOR: IInterpolator = {
  id: 'linear_spline',
  implementationDate: '2018-09-10',
  visibleByDefault: true,
  interpolate(knots: KnotMapping) {
    return splineFromKnots(1, knots)
  },
}
