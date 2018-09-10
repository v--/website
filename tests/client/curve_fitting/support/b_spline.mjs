/* globals describe it */

import { expect } from '../../../_common.mjs'

import BSPline, { NotEnoughPointsError } from '../../../../code/client/curve_fitting/support/b_spline.mjs'

describe('BSPline', function () {
  describe('.constructor()', function () {
    it('fails when passed less than two points', function () {
      expect(function () {
        return new BSPline([])
      }).to.throw(NotEnoughPointsError)
    })
  })

  describe('.evaluate()', function () {
    it('correctly evaluates a B-Spline of degree 0', function () {
      const spline = new BSPline([0, 1])
      expect(spline.evaluate(0)).to.equal(1)
      expect(spline.evaluate(1)).to.equal(0)
    })

    it.only('correctly evaluates a B-Spline of degree 2', function () {
      const spline = new BSPline([0, 1, 2, 3])
      expect(spline.evaluate(0)).to.equal(0)
      expect(spline.evaluate(1)).to.equal(1 / 6)
      expect(spline.evaluate(2)).to.equal(1 / 6)
      expect(spline.evaluate(3)).to.equal(0)
    })
  })
})
