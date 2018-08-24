/* globals describe it */

import { expect } from '../../../../code/tests'

import Polynomial from '../../../../code/client/curve_fitting/support/polynomial'

describe('Polynomial', function () {
  describe('.constructor()', function () {
    it('strips leading zeros', function () {
      const p1 = new Polynomial([0, 1])
      const p2 = new Polynomial([1])
      expect(p1.coefficients).to.deep.equal(p2.coefficients)
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

  describe('.toString()', function () {
    it('handles the zero polynomial', function () {
      const p = new Polynomial([])
      expect(String(p)).to.equal('0')
    })

    it('handles linear polynomials', function () {
      const p = new Polynomial([1])
      expect(String(p)).to.equal('1')
    })

    it('handles cubic polynomials', function () {
      const p = new Polynomial([1, 2, 3])
      expect(String(p)).to.equal('x^2 + 2x + 3')
    })

    it('handles cubic mononomials', function () {
      const p = new Polynomial([1, 0, 0])
      expect(String(p)).to.equal('x^2')
    })
  })

  describe('.evaluate()', function () {
    it('Evaluates a polynomial', function () {
      const p = new Polynomial([1, 2, 3])
      expect(p.evaluate(2)).to.equal(11)
    })
  })
})
