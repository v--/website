import { union } from '../../support/iteration.js'
import { isSameNumber, roundNumber } from '../numeric/floating.js'
import { Polynomial, PolynomialError, ZeroPolynomialError } from './polynomial.js'

export class PolynomialRootError extends PolynomialError { }

const MAX_ITER = 1000
const STURM_LEFT_BOUND_OFFSET = 1e-10

/**
 * @param {TNum.Float64[]} array
 * @returns {TNum.UInt32}
 */
function countSignChanges(array) {
  let changeCount = 0

  for (let i = 1; i < array.length; i++) {
    if (array[i] * array[i - 1] < 0) {
      changeCount += 1
    }
  }

  return changeCount
}

/**
 * @param {Polynomial[]} array
 * @param {TNum.Float64} x
 * @returns {TNum.Float64[]}
 */
function evalArray(array, x) {
  return array.map(p => p.eval(x))
}

/**
 * @param {Polynomial} polynomial
 * @returns {Iterable<Polynomial>}
 */
function* iterSturmSequence(polynomial) {
  let p0 = polynomial
  let p1 = p0.getDerivative()
  yield p0

  while (!p1.isZeroPolynomial()) {
    const { rem } = p0.div(p1)
    p0 = p1
    p1 = rem.scale(-1)
    yield p0
  }
}

/**
 * @param {Polynomial} polynomial
 * @param {Polynomial[]} sturmSequence
 * @param {TNum.Float64} a
 * @param {TNum.Float64} b
 * @param {TNum.UInt32} iter
 * @returns {Set<TNum.Float64>}
 */
function findRootsIn(polynomial, sturmSequence, a, b, iter = 0) {
  const rootCount = countSignChanges(evalArray(sturmSequence, a)) - countSignChanges(evalArray(sturmSequence, b))

  if (rootCount === 0 || iter > MAX_ITER) {
    return new Set()
  }

  const c = (a + b) / 2

  if (isSameNumber(polynomial.eval(c), 0)) {
    return new Set([roundNumber(c)])
  }

  return union(
    findRootsIn(polynomial, sturmSequence, a, c, iter + 1),
    findRootsIn(polynomial, sturmSequence, c, b, iter + 1)
  )
}

/**
 * @param {Polynomial} polynomial
 * @returns {Set<TNum.Float64>}
 */
export function numericallyFindRoots(polynomial) {
  if (polynomial.isZeroPolynomial()) {
    throw new ZeroPolynomialError('Cannot enumerate the roots of the zero polynomial')
  }

  const upperBound = Math.max(...polynomial.coef.map(c => Math.abs(c / polynomial.leading)))
  const sturmSequence = Array.from(iterSturmSequence(polynomial))
  return findRootsIn(polynomial, sturmSequence, -upperBound - STURM_LEFT_BOUND_OFFSET, upperBound)
}
