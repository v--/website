import { describe, it, assert, assertCustomEqual, assertReprEqual, assertSameNumber } from '../../../_test_common.js'

import { Polynomial, ZeroPolynomialError } from './polynomial.js'

describe('Polynomial', function() {
  describe('.stripTrailingZeroes()', function() {
    it('strips trailing zeros', function() {
      const p = Polynomial.stripTrailingZeroes([1, 0])
      assert.strictEqual(String(p), '1')
    })

    it('leaves at least one zero', function() {
      const p = Polynomial.stripTrailingZeroes([])
      assertCustomEqual(p, Polynomial.ZERO)
    })
  })

  describe('#add()', function() {
    it('adds two polynomials of identical degrees', function() {
      const p1 = new Polynomial({ coef: [1] })
      const p2 = new Polynomial({ coef: [1] })
      assert.strictEqual(String(p1.add(p2)), '2')
    })

    it('adds two polynomials of different degrees', function() {
      const p1 = new Polynomial({ coef: [1] })
      const p2 = new Polynomial({ coef: [1, 1] })
      assert.strictEqual(String(p1.add(p2)), 'x + 2')
    })
  })

  describe('#mult()', function() {
    it('multiplies quadratic polynomials', function() {
      const p1 = new Polynomial({ coef: [2, 1] })
      const p2 = new Polynomial({ coef: [4, 3] })
      assert.strictEqual(String(p1.mult(p2)), '3x^2 + 10x + 8')
    })

    it('multiplies cubic polynomials', function() {
      const p1 = new Polynomial({ coef: [3, 2, 1] })
      const p2 = new Polynomial({ coef: [5, 4, 3] })
      assert.strictEqual(String(p1.mult(p2)), '3x^4 + 10x^3 + 22x^2 + 22x + 15')
    })
  })

  describe('#eval()', function() {
    it('evaluates the zero polynomial', function() {
      const p = Polynomial.ZERO
      assert.strictEqual(p.eval(-2), p.eval(3))
    })

    it('evaluates a constant polynomial', function() {
      const p = new Polynomial({ coef: [1] })
      assert.strictEqual(p.eval(-2), p.eval(3))
    })

    it('evaluates a linear polynomial', function() {
      const p = new Polynomial({ coef: [0, 1] })
      assert.strictEqual(p.eval(-2), -2)
    })

    it('evaluates a cubic polynomial', function() {
      const p = new Polynomial({ coef: [8, 0, 0, 1] })
      assert.strictEqual(p.eval(-2), 0)
    })
  })

  describe('#getDerivative()', function() {
    it('finds the derivative of the zero polynomial', function() {
      const p = Polynomial.ZERO
      assertCustomEqual(p.getDerivative(), p)
    })

    it('finds the derivative of a constant polynomial', function() {
      const p = new Polynomial({ coef: [3] })
      assertReprEqual(p.getDerivative(), '0')
    })

    it('finds the derivative of a cubic polynomial', function() {
      const p = new Polynomial({ coef: [1, 2, 3, 4] })
      assertReprEqual(p.getDerivative(), '12x^2 + 6x + 2')
    })
  })

  describe('#div()', function() {
    it('throws when trying to divide by the zero polynomial', function() {
      const p = new Polynomial({ coef: [1] })

      assert.throws(function() {
        p.div(Polynomial.ZERO)
      }, ZeroPolynomialError)
    })

    it('divides a linear polynomial by a constant polynomial', function() {
      const p = new Polynomial({ coef: [2, 2] })
      const q = new Polynomial({ coef: [1] })
      const { quot, rem } = p.div(q)

      assertCustomEqual(q.mult(quot).add(rem), p)
    })

    it('divides a quadratic polynomial by a linear polynomial', function() {
      const p = new Polynomial({ coef: [2, 2, 2] })
      const q = new Polynomial({ coef: [1, 3] })
      const { quot, rem } = p.div(q)

      assertCustomEqual(q.mult(quot).add(rem), p)
    })

    it('divides a quadratic polynomial by a quadratic polynomial', function() {
      const p = new Polynomial({ coef: [2, 2, 2] })
      const q = new Polynomial({ coef: [1, 3, 5] })
      const { quot, rem } = p.div(q)

      assertCustomEqual(q.mult(quot).add(rem), p)
    })
  })
})
