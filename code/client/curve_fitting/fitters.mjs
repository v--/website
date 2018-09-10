import newtonPolynomial from './fitters/newton_polynomial.mjs'
import linearLeastSquares from './fitters/linear_least_squares.mjs'
import linearSpline from './fitters/linear_spline.mjs'
import quadraticSpline from './fitters/quadratic_spline.mjs'

export default Object.freeze([
  newtonPolynomial,
  linearLeastSquares,
  linearSpline,
  quadraticSpline
])
