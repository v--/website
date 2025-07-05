import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ZeroUnivariatePolynomialError } from './errors.ts'
import { UnivariatePolynomial, ZERO_POLYNOMIAL } from './univariate_polynomial.ts'
import { assertCustomEqual } from '../../../testing/assertion.ts'

describe('UnivariatePolynomial class', function () {
  describe('add method', function () {
    it('adds two polynomials of identical degrees', function () {
      const p1 = new UnivariatePolynomial({ coeff: [1] })
      const p2 = new UnivariatePolynomial({ coeff: [1] })
      const expected = new UnivariatePolynomial({ coeff: [2] })

      assertCustomEqual(p1.add(p2), expected)
    })

    it('adds two polynomials of different degrees', function () {
      const p1 = new UnivariatePolynomial({ coeff: [1] })
      const p2 = new UnivariatePolynomial({ coeff: [1, 1] })
      const expected = new UnivariatePolynomial({ coeff: [2, 1] })

      assertCustomEqual(p1.add(p2), expected)
    })
  })

  describe('mult method', function () {
    it('multiplies a linear polynomial by a constant', function () {
      const p1 = new UnivariatePolynomial({ coeff: [1] })
      const p2 = new UnivariatePolynomial({ coeff: [0, 2] })
      const expected = p2

      assertCustomEqual(p1.mult(p2), expected)
    })

    it('multiplies quadratic polynomials', function () {
      const p1 = new UnivariatePolynomial({ coeff: [2, 1] })
      const p2 = new UnivariatePolynomial({ coeff: [4, 3] })
      const expected = new UnivariatePolynomial({ coeff: [8, 10, 3] })

      assertCustomEqual(p1.mult(p2), expected)
    })

    it('multiplies cubic polynomials', function () {
      const p1 = new UnivariatePolynomial({ coeff: [3, 2, 1] })
      const p2 = new UnivariatePolynomial({ coeff: [5, 4, 3] })
      const expected = new UnivariatePolynomial({ coeff: [15, 22, 22, 10, 3] })

      assertCustomEqual(p1.mult(p2), expected)
    })
  })

  describe('eval method', function () {
    it('evaluates the zero polynomial', function () {
      const p = ZERO_POLYNOMIAL
      assert.equal(p.eval(-2), p.eval(3))
    })

    it('evaluates a constant polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [1] })
      assert.equal(p.eval(-2), p.eval(3))
    })

    it('evaluates a linear polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [0, 1] })
      assert.equal(p.eval(-2), -2)
    })

    it('evaluates a cubic polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [8, 0, 0, 1] })
      assert.equal(p.eval(-2), 0)
    })
  })

  describe('getDerivative method', function () {
    it('finds the derivative of the zero polynomial', function () {
      const p = ZERO_POLYNOMIAL
      const expected = ZERO_POLYNOMIAL
      assertCustomEqual(p.getDerivative(), expected)
    })

    it('finds the derivative of a constant polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [3] })
      const expected = ZERO_POLYNOMIAL
      assertCustomEqual(p.getDerivative(), expected)
    })

    it('finds the derivative of a cubic polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [1, 2, 3, 4] })
      const expected = new UnivariatePolynomial({ coeff: [2, 6, 12] })
      assertCustomEqual(p.getDerivative(), expected)
    })
  })

  describe('divmod method', function () {
    it('throws when trying to divide by the zero polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [1] })

      assert.throws(
        function () {
          p.divmod(ZERO_POLYNOMIAL)
        },
        ZeroUnivariatePolynomialError,
      )
    })

    it('divides a linear polynomial by a constant polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [2, 2] })
      const q = new UnivariatePolynomial({ coeff: [1] })
      const { quot, rem } = p.divmod(q)

      assertCustomEqual(q.mult(quot).add(rem), p)
    })

    it('divides a quadratic polynomial by a linear polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [2, 2, 2] })
      const q = new UnivariatePolynomial({ coeff: [1, 3] })
      const { quot, rem } = p.divmod(q)

      assertCustomEqual(q.mult(quot).add(rem), p)
    })

    it('divides a quadratic polynomial by a quadratic polynomial', function () {
      const p = new UnivariatePolynomial({ coeff: [2, 2, 2] })
      const q = new UnivariatePolynomial({ coeff: [1, 3, 5] })
      const { quot, rem } = p.divmod(q)

      assertCustomEqual(q.mult(quot).add(rem), p)
    })
  })
})
