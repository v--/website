import { LINEAR_SPLINE_INTERPOLATOR } from './linear-spline.ts'
import { type IInterpolator } from '../types.ts'
import { CUBIC_SPLINE_INTERPOLATOR } from './cubic-spline.ts'
import { LINEAR_LEAST_SQUARES_INTERPOLATOR } from './linear-least-squares.ts'
import { NEWTON_POLYNOMIAL_INTERPOLATOR } from './newton-polynomial.ts'
import { QUADRATIC_SPLINE_INTERPOLATOR } from './quadratic-spline.ts'

export const INTERPOLATORS: readonly IInterpolator[] = Object.freeze([
  NEWTON_POLYNOMIAL_INTERPOLATOR,
  LINEAR_LEAST_SQUARES_INTERPOLATOR,
  LINEAR_SPLINE_INTERPOLATOR,
  QUADRATIC_SPLINE_INTERPOLATOR,
  CUBIC_SPLINE_INTERPOLATOR,
])
