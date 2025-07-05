import { LINEAR_SPLINE_INTERPOLATOR } from './linear_spline.ts'
import { type IInterpolator } from '../types.ts'
import { CUBIC_SPLINE_INTERPOLATOR } from './cubic_spline.ts'
import { LINEAR_LEAST_SQUARES_INTERPOLATOR } from './linear_least_squares.ts'
import { NEWTON_POLYNOMIAL_INTERPOLATOR } from './newton_polynomial.ts'
import { QUADRATIC_SPLINE_INTERPOLATOR } from './quadratic_spline.ts'

export const INTERPOLATORS: readonly IInterpolator[] = Object.freeze([
  NEWTON_POLYNOMIAL_INTERPOLATOR,
  LINEAR_LEAST_SQUARES_INTERPOLATOR,
  LINEAR_SPLINE_INTERPOLATOR,
  QUADRATIC_SPLINE_INTERPOLATOR,
  CUBIC_SPLINE_INTERPOLATOR,
])
