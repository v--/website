export { BSpline } from './numeric/b-spline.ts'
export { dotprod, sum } from './numeric/common.ts'
export {
  ConvergenceError,
  DimensionError,
  DimensionMismatchError,
  KnotError,
  KnotExistenceError,
  KnotUniquenessError,
  NumericError,
} from './numeric/errors.ts'
export { KnotMapping } from './numeric/knot-mapping.ts'
export { constructNewtonUnivariatePolynomial } from './numeric/newton-polynomial.ts'
export { splineFromKnots } from './numeric/spline-interpolation.ts'
export { Spline } from './numeric/spline.ts'
export { type ISymbolicFunction } from './numeric/types.ts'
