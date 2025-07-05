import { type KnotMapping, splineFromKnots } from '../../../common/math/numeric.ts'
import { type IInterpolator } from '../types.ts'

export const CUBIC_SPLINE_INTERPOLATOR: IInterpolator = {
  id: 'cubic_spline',
  implementationDate: '2018-09-10',
  visibleByDefault: false,
  interpolate(knots: KnotMapping) {
    return splineFromKnots(3, knots)
  },
}
