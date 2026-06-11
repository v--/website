import { INTERPOLATORS } from './interpolation.ts'
import { type IInterpolationState, type IInterpolator } from './types.ts'
import { AARect } from '../../common/math/geom2d.ts'
import { KnotMapping } from '../../common/math/numeric.ts'

export const STAGE = new AARect({
  width: 21,
  height: 14,
  x: -10.5,
  y: -6.5,
})

export const CURVE_RESOLUTION = 0.1
export const DEFAULT_KNOTS = new KnotMapping([
  { x: -7, y: -2 },
  { x: 0, y: 2 },
  { x: 5, y: -1 },
  { x: 8, y: 3 },
])

export const DEFAULT_STATE: IInterpolationState = {
  knots: DEFAULT_KNOTS,
  visible: Object.fromEntries(
    INTERPOLATORS.map(
      ({ id, visibleByDefault }) => [id, Boolean(visibleByDefault)],
    ),
  ),
  interpolated: INTERPOLATORS.map(function (interpolator: IInterpolator) {
    return {
      interpolator,
      fun: interpolator.interpolate(DEFAULT_KNOTS),
    }
  }),
}
