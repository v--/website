/* globals describe it */

import { assert } from '../../../_common.mjs'

import Polynomial from '../../../../code/client/curve_fitting/symbolic/polynomial.mjs'

describe('Polynomial', function () {
  describe('.constructor()', function () {
    it('strips leading zeros', function () {
      const p1 = new Polynomial([0, 1])
      const p2 = new Polynomial([1])
      assert.deepEqual(p1.coef, p2.coef)
    })

    it('leaves at least one zero', function () {
      const p = new Polynomial([])
      assert.deepEqual(p.coef, [0])
    })
  })

  describe('.add()', function () {
    it('adds two polynomials of identical degrees', function () {
      const p1 = new Polynomial([1])
      const p2 = new Polynomial([1])
      assert.equal(String(p1.add(p2)), '2')
    })

    it('adds two polynomials of different degrees', function () {
      const p1 = new Polynomial([1])
      const p2 = new Polynomial([1, 1])
      assert.equal(String(p1.add(p2)), 'x + 2')
    })
  })

  describe('.multiply()', function () {
    it('multiplies quadratic polynomials', function () {
      const p1 = new Polynomial([1, 2])
      const p2 = new Polynomial([3, 4])
      assert.equal(String(p1.multiply(p2)), '3x^2 + 10x + 8')
    })

    it('multiplies cubic polynomials', function () {
      const p1 = new Polynomial([1, 2, 3])
      const p2 = new Polynomial([3, 4, 5])
      assert.equal(String(p1.multiply(p2)), '3x^4 + 10x^3 + 22x^2 + 22x + 15')
    })
  })

  describe('.eval()', function () {
    it('Evaluates a polynomial', function () {
      const p = new Polynomial([1, 2, 3])
      assert.equal(p.eval(2), 11)
    })
  })
})
