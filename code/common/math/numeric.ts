export { BSpline } from './numeric/b_spline.ts'
export { dotprod, sum } from './numeric/common.ts'
export {
  DimensionError,
  DimensionMismatchError,
  KnotError,
  KnotExistenceError,
  KnotUniquenessError,
  NumericError,
} from './numeric/errors.ts'
export { KnotMapping } from './numeric/knot_mapping.ts'
export { constructNewtonUnivariatePolynomial } from './numeric/newton_polynomial.ts'
export { splineFromKnots } from './numeric/spline_interpolation.ts'
export { Spline } from './numeric/spline.ts'
export { type ISymbolicFunction } from './numeric/types.ts'
