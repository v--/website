import { CoolError } from '../../errors.js'
import { union, chain, range, repeat, zip, map, all } from '../../support/iteration.js'

import { stringifyLinearCombination } from '../stringify.js'
import { isSameNumber, roundNumber } from '../../../common/math/numeric/floating.js'

const MAX_ITER = 1000
const STURM_LEFT_BOUND_OFFSET = 1e-10

export function countSignChanges (array) {
  let changeCount = 0

  for (let i = 1; i < array.length; i++) {
    if (array[i] * array[i - 1] < 0) {
      changeCount += 1
    }
  }

  return changeCount
}

export function evalArray (array, x) {
  return array.map(p => p.eval(x))
}

function monomialString (n) {
  if (n === 0) {
    return ''
  }

  if (n === 1) {
    return 'x'
  }

  return `x^${n}`
}

export class PolynomialError extends CoolError {}
export class PolynomialRootError extends PolynomialError {}
export class ZeroPolynomialError extends PolynomialError {}

export class Polynomial {
  static stripTrailingZeroes (coeffs) {
    let prefixLength = coeffs.length

    while (coeffs[prefixLength - 1] === 0) {
      prefixLength--
    }

    if (prefixLength === 0) {
      return Polynomial.ZERO
    }

    return new Polynomial(coeffs.slice(0, prefixLength))
  }

  constructor (coeffs) {
    this.coeffs = coeffs
  }

  add (other) {
    const n = Math.max(this.order, other.order)
    const coef = map(
      ([a, b]) => a + b,
      zip(
        chain(this.coeffs, repeat(0, n - this.order)),
        chain(other.coeffs, repeat(0, n - other.order))
      )
    )

    return Polynomial.stripTrailingZeroes(Array.from(coef))
  }

  sub (other) {
    return this.add(other.scale(-1))
  }

  scale (scalar) {
    if (scalar === 0) {
      return Polynomial.ZERO
    }

    return new Polynomial(this.coeffs.map(c => c * scalar))
  }

  mult (other) {
    const coef = []

    for (let k = 0; k < this.order + other.order + 1; k++) {
      let c = 0

      for (let i = Math.max(0, k - other.order); i <= Math.min(k, this.order); i++) {
        c += this.coeffs[i] * other.coeffs[k - i]
      }

      coef.push(c)
    }

    return new Polynomial(coef)
  }

  div (other) {
    if (other.isZeroPolynomial()) {
      throw new ZeroPolynomialError('Cannot divide by the zero polynomial')
    }

    if (this.order < other.order) {
      return {
        quot: Polynomial.ZERO,
        rem: this
      }
    }

    if (this.order === 0) {
      return {
        quot: new Polynomial([this.coeffs[0] / other.coeffs[0]]),
        rem: Polynomial.ZERO
      }
    }

    const aux = new Polynomial(
      Array.from(
        chain(
          repeat(0, this.order - other.order),
          [this.leading / other.leading]
        )
      )
    )

    const { quot, rem } = this.sub(other.mult(aux)).div(other)

    return {
      quot: quot.add(aux),
      rem: rem
    }
  }

  eval (x) {
    let result = 0

    for (let i = this.order; i > 0; i--) {
      result = x * (this.coeffs[i] + result)
    }

    result += this.coeffs[0]
    return result
  }

  get order () {
    return this.coeffs.length - 1
  }

  get leading () {
    return this.coeffs[this.order]
  }

  equals (other) {
    return this.order === other.order && all(([a, b]) => a === b, zip(this.coeffs, other.coeffs))
  }

  getDerivative () {
    return Polynomial.stripTrailingZeroes(
      this.coeffs.map((c, i) => c * i).slice(1)
    )
  }

  * iterSturmSequence () {
    let p0 = this
    let p1 = this.getDerivative()
    yield p0

    while (!p1.isZeroPolynomial()) {
      const { rem } = p0.div(p1)
      p0 = p1
      p1 = rem.scale(-1)
      yield p0
    }
  }

  _findRootsIn (sturmSequence, a, b, iter = 0) {
    const rootCount = countSignChanges(evalArray(sturmSequence, a)) - countSignChanges(evalArray(sturmSequence, b))

    if (rootCount === 0 || iter > MAX_ITER) {
      return new Set()
    }

    const c = (a + b) / 2

    if (isSameNumber(this.eval(c), 0)) {
      return new Set([roundNumber(c)])
    }

    return union(
      this._findRootsIn(sturmSequence, a, c, iter + 1),
      this._findRootsIn(sturmSequence, c, b, iter + 1)
    )
  }

  numericallyFindRoots () {
    if (this.isZeroPolynomial()) {
      throw new ZeroPolynomialError('Cannot enumerate the roots of the zero polynomial')
    }

    const upperBound = Math.max(...this.coeffs.map(c => Math.abs(c / this.leading)))
    const sturmSequence = Array.from(this.iterSturmSequence())
    return this._findRootsIn(sturmSequence, -upperBound - STURM_LEFT_BOUND_OFFSET, upperBound)
  }

  isZeroPolynomial () {
    return this.order === 0 && this.coeffs[0] === 0
  }

  toString () {
    const monomials = Array.from(map(monomialString, range(this.order, -1, -1)))
    return stringifyLinearCombination(this.coeffs.slice().reverse(), monomials)
  }
}

Polynomial.ZERO = new Polynomial([0])
