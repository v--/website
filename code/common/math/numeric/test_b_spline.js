import { describe, it, assert } from '../../../_test_common.js'

import { BSpline, NotEnoughPointsError } from './b_spline.js'

describe('BSpline', function() {
  describe('#constructor()', function() {
    it('fails when passed less than two points', function() {
      assert.throws(function() {
        return new BSpline({ points: [] })
      }, NotEnoughPointsError)
    })
  })

  describe('#eval()', function() {
    it('correctly evaluates a B-Spline of degree 0', function() {
      const spline = new BSpline({ points: [0, 1] })
      assert.equal(spline.eval(0), 1)
      assert.equal(spline.eval(1), 0)
    })

    it('correctly evaluates a B-Spline of degree 2', function() {
      const spline = new BSpline({ points: [0, 1, 2, 3] })
      assert.equal(spline.eval(0), 0)
      assert.equal(spline.eval(1), 1 / 6)
      assert.equal(spline.eval(2), 1 / 6)
      assert.equal(spline.eval(3), 0)
    })
  })
})
