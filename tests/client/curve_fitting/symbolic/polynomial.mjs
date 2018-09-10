/* globals describe it */

import { expect } from '../../../_common.mjs'

import Polynomial from '../../../../code/client/curve_fitting/symbolic/polynomial.mjs'

describe('Polynomial', function () {
  describe('.constructor()', function () {
    it('strips leading zeros', function () {
      const p1 = new Polynomial([0, 1])
      const p2 = new Polynomial([1])
      expect(p1.coef).to.deep.equal(p2.coef)
    })

    it('leaves at least one zero', function () {
      const p = new Polynomial([])
      expect(p.coef).to.deep.equal([0])
    })
  })

  describe('.add()', function () {
    it('adds two polynomials of identical degrees', function () {
      const p1 = new Polynomial([1])
      const p2 = new Polynomial([1])
      expect(String(p1.add(p2))).to.equal('2')
    })

    it('adds two polynomials of different degrees', function () {
      const p1 = new Polynomial([1])
      const p2 = new Polynomial([1, 1])
      expect(String(p1.add(p2))).to.equal('x + 2')
    })
  })

  describe('.multiply()', function () {
    it('multiplies quadratic polynomials', function () {
      const p1 = new Polynomial([1, 2])
      const p2 = new Polynomial([3, 4])
      expect(String(p1.multiply(p2))).to.equal('3x^2 + 10x + 8')
    })

    it('multiplies cubic polynomials', function () {
      const p1 = new Polynomial([1, 2, 3])
      const p2 = new Polynomial([3, 4, 5])
      expect(String(p1.multiply(p2))).to.equal('3x^4 + 10x^3 + 22x^2 + 22x + 15')
    })
  })

  describe('.eval()', function () {
    it('Evaluates a polynomial', function () {
      const p = new Polynomial([1, 2, 3])
      expect(p.eval(2)).to.equal(11)
    })
  })
})
