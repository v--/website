import { newtonPolynomial } from './fitters/newton_polynomial.js'
import { linearLeastSquares } from './fitters/linear_least_squares.js'
import { linearSpline } from './fitters/linear_spline.js'
import { quadraticSpline } from './fitters/quadratic_spline.js'

export const fitters = Object.freeze([
  newtonPolynomial,
  linearLeastSquares,
  linearSpline,
  quadraticSpline
])
