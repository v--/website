import { CoolError } from '../../errors.js'
import { all, chain, map, range, repeat, zip2 } from '../../support/iteration.js'

import { stringifyLinearCombination } from '../stringify.js'

/** @param {TNum.UInt32} n */
function monomialString(n) {
  if (n === 0) {
    return ''
  }

  if (n === 1) {
    return 'x'
  }

  return `x^${n}`
}

export class PolynomialError extends CoolError {}
export class ZeroPolynomialError extends PolynomialError {}

/**
 * @implements TAlgebra.IPolynomial, TNumeric.IRealFunction
 */
export class Polynomial {
  static ZERO = new Polynomial({ coef: [0] })

  /** @param {TNum.Float64[]} coef */
  static stripTrailingZeroes(coef) {
    let prefixLength = coef.length

    while (coef[prefixLength - 1] === 0) {
      prefixLength--
    }

    if (prefixLength === 0) {
      return Polynomial.ZERO
    }

    return new Polynomial({
      coef: coef.slice(0, prefixLength)
    })
  }

  /** @param {TAlgebra.IPolynomialParams} params */
  constructor({ coef }) {
    this.coef = coef
  }

  /** @param {Polynomial} other */
  add(other) {
    const n = Math.max(this.order, other.order)
    const coef = map(
      ([a, b]) => a + b,
      zip2(
        chain(this.coef, repeat(0, n - this.order)),
        chain(other.coef, repeat(0, n - other.order))
      )
    )

    return Polynomial.stripTrailingZeroes(Array.from(coef))
  }

  /** @param {Polynomial} other */
  sub(other) {
    return this.add(other.scale(-1))
  }

  /** @param {TNum.Float64} scalar */
  scale(scalar) {
    if (scalar === 0) {
      return Polynomial.ZERO
    }

    return new Polynomial({
      coef: this.coef.map(c => c * scalar)
    })
  }

  /**
   * @param {Polynomial} other
   */
  mult(other) {
    const coef = []

    for (let k = 0; k < this.order + other.order + 1; k++) {
      let c = 0

      for (let i = Math.max(0, k - other.order); i <= Math.min(k, this.order); i++) {
        c += this.coef[i] * other.coef[k - i]
      }

      coef.push(c)
    }

    return new Polynomial({ coef })
  }

  /**
   * @param {Polynomial} other
   * @returns {{ quot: Polynomial, rem: Polynomial }}
   */
  div(other) {
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
        quot: new Polynomial({
          coef: [this.coef[0] / other.coef[0]]
        }),

        rem: Polynomial.ZERO
      }
    }

    const aux = new Polynomial({
      coef: Array.from(
        chain(
          repeat(0, this.order - other.order),
          [this.leading / other.leading]
        )
      )
    })

    const { quot, rem } = this.sub(other.mult(aux)).div(other)

    return {
      quot: quot.add(aux),
      rem
    }
  }

  /**
   * @param {TNum.Float64} x
   */
  eval(x) {
    let result = 0

    for (let i = this.order; i > 0; i--) {
      result = x * (this.coef[i] + result)
    }

    result += this.coef[0]
    return result
  }

  get order() {
    return this.coef.length - 1
  }

  get leading() {
    return this.coef[this.order]
  }

  /**
   * @param {Polynomial} other
   */
  equals(other) {
    return this.order === other.order && all(([a, b]) => a === b, zip2(this.coef, other.coef))
  }

  getDerivative() {
    return Polynomial.stripTrailingZeroes(
      this.coef.map((c, i) => c * i).slice(1)
    )
  }

  isZeroPolynomial() {
    return this.order === 0 && this.coef[0] === 0
  }

  toString() {
    const monomials = Array.from(map(monomialString, range(this.order, -1, -1)))
    return stringifyLinearCombination(this.coef.slice().reverse(), monomials)
  }
}
