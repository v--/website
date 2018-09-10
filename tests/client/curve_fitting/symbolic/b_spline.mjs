/* globals describe it */

import { expect } from '../../../_common.mjs'

import BSpline, { NotEnoughPointsError } from '../../../../code/client/curve_fitting/symbolic/b_spline.mjs'

describe('BSpline', function () {
  describe('.constructor()', function () {
    it('fails when passed less than two points', function () {
      expect(function () {
        return new BSpline([])
      }).to.throw(NotEnoughPointsError)
    })
  })

  describe('.eval()', function () {
    it('correctly evaluates a B-Spline of degree 0', function () {
      const spline = new BSpline([0, 1])
      expect(spline.eval(0)).to.equal(1)
      expect(spline.eval(1)).to.equal(0)
    })

    it('correctly evaluates a B-Spline of degree 2', function () {
      const spline = new BSpline([0, 1, 2, 3])
      expect(spline.eval(0)).to.equal(0)
      expect(spline.eval(1)).to.equal(1 / 6)
      expect(spline.eval(2)).to.equal(1 / 6)
      expect(spline.eval(3)).to.equal(0)
    })
  })
})
