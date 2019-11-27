import { describe, it, assert } from '../../../_common.js'

import { sort } from '../../../../code/common/support/iteration.js'
import { Polynomial, ZeroPolynomialError } from '../../../../code/common/math/algebra/polynomial.js'

describe('Polynomial', function () {
  describe('.stripTrailingZeroes()', function () {
    it('strips trailing zeros', function () {
      const p = Polynomial.stripTrailingZeroes([1, 0])
      assert.strictEqual(String(p), '1')
    })

    it('leaves at least one zero', function () {
      const p = Polynomial.stripTrailingZeroes([])
      assert.customEqual(p, Polynomial.ZERO)
    })
  })

  describe('#add()', function () {
    it('adds two polynomials of identical degrees', function () {
      const p1 = new Polynomial([1])
      const p2 = new Polynomial([1])
      assert.strictEqual(String(p1.add(p2)), '2')
    })

    it('adds two polynomials of different degrees', function () {
      const p1 = new Polynomial([1])
      const p2 = new Polynomial([1, 1])
      assert.strictEqual(String(p1.add(p2)), 'x + 2')
    })
  })

  describe('#mult()', function () {
    it('multiplies quadratic polynomials', function () {
      const p1 = new Polynomial([2, 1])
      const p2 = new Polynomial([4, 3])
      assert.strictEqual(String(p1.mult(p2)), '3x^2 + 10x + 8')
    })

    it('multiplies cubic polynomials', function () {
      const p1 = new Polynomial([3, 2, 1])
      const p2 = new Polynomial([5, 4, 3])
      assert.strictEqual(String(p1.mult(p2)), '3x^4 + 10x^3 + 22x^2 + 22x + 15')
    })
  })

  describe('#eval()', function () {
    it('evaluates the zero polynomial', function () {
      const p = Polynomial.ZERO
      assert.strictEqual(p.eval(-2), p.eval(3))
    })

    it('evaluates a constant polynomial', function () {
      const p = new Polynomial([1])
      assert.strictEqual(p.eval(-2), p.eval(3))
    })

    it('evaluates a linear polynomial', function () {
      const p = new Polynomial([0, 1])
      assert.strictEqual(p.eval(-2), -2)
    })

    it('evaluates a cubic polynomial', function () {
      const p = new Polynomial([8, 0, 0, 1])
      assert.strictEqual(p.eval(-2), 0)
    })
  })

  describe('#getDerivative()', function () {
    it('finds the derivative of the zero polynomial', function () {
      const p = Polynomial.ZERO
      assert.customEqual(p.getDerivative(), p)
    })

    it('finds the derivative of a constant polynomial', function () {
      const p = new Polynomial([3])
      assert.reprEqual(p.getDerivative(), '0')
    })

    it('finds the derivative of a cubic polynomial', function () {
      const p = new Polynomial([1, 2, 3, 4])
      assert.reprEqual(p.getDerivative(), '12x^2 + 6x + 2')
    })
  })

  describe('#div()', function () {
    it('throws when trying to divide by the zero polynomial', function () {
      const p = new Polynomial([1])

      assert.throws(function () {
        p.div(Polynomial.ZERO)
      }, ZeroPolynomialError)
    })

    it('divides a linear polynomial by a constant polynomial', function () {
      const p = new Polynomial([2, 2])
      const q = new Polynomial([1])
      const { quot, rem } = p.div(q)

      assert.customEqual(q.mult(quot).add(rem), p)
    })

    it('divides a quadratic polynomial by a linear polynomial', function () {
      const p = new Polynomial([2, 2, 2])
      const q = new Polynomial([1, 3])
      const { quot, rem } = p.div(q)

      assert.customEqual(q.mult(quot).add(rem), p)
    })

    it('divides a quadratic polynomial by a quadratic polynomial', function () {
      const p = new Polynomial([2, 2, 2])
      const q = new Polynomial([1, 3, 5])
      const { quot, rem } = p.div(q)

      assert.customEqual(q.mult(quot).add(rem), p)
    })
  })

  describe('#numericallyFindRoots()', function () {
    it('throws when trying to find roots of a zero polynomial', function () {
      assert.throws(function () {
        Polynomial.ZERO.numericallyFindRoots()
      }, ZeroPolynomialError)
    })

    it('finds no roots for a constant polynomial', function () {
      const p = new Polynomial([3])
      assert.empty(p.numericallyFindRoots())
    })

    it('finds the sole root of a linear polynomial', function () {
      const p = new Polynomial([1, 1])
      const rootSet = p.numericallyFindRoots()
      const roots = sort(rootSet)
      assert.lengthOf(roots, 1)
      assert.sameNumber(roots[0], -1)
    })

    it('finds the roots of a quadratic polynomial with real roots', function () {
      const p = new Polynomial([-1, 0, 1])
      const rootSet = p.numericallyFindRoots()
      const roots = sort(rootSet)
      assert.lengthOf(roots, 2)
      assert.sameNumber(roots[0], -1)
      assert.sameNumber(roots[1], 1)
    })

    it('finds the sole real root of a quadratic polynomial', function () {
      const p = new Polynomial([1, 2, 1])
      const rootSet = p.numericallyFindRoots()
      const roots = sort(rootSet)
      assert.lengthOf(roots, 1)
      assert.closeTo(roots[0], -1, 1e-3)
    })

    it('finds the zero real roots of a quadratic polynomial', function () {
      const p = new Polynomial([1, 0, 1])
      const rootSet = p.numericallyFindRoots()
      assert.empty(rootSet)
    })

    it('finds all real roots of the 4-degree Wilkinson polynomial', function () {
      let p = new Polynomial([1])

      for (let x = 1; x <= 4; x++) {
        p = p.mult(new Polynomial([-x, 1]))
      }

      const rootSet = p.numericallyFindRoots()
      const roots = sort(rootSet)
      assert.lengthOf(roots, 4)

      for (let x = 1; x <= 4; x++) {
        assert.sameNumber(roots[x - 1], x)
      }
    })
  })
})
