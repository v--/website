import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { BSpline } from './b_spline.ts'
import { KnotExistenceError } from './errors.ts'

describe('BSpline class', function () {
  describe('constructor', function () {
    it('fails when passed less than two points', function () {
      assert.throws(
        function () {
          return new BSpline({ points: [] })
        },
        KnotExistenceError,
      )
    })
  })

  describe('eval method', function () {
    it('correctly evaluates a B-spline of degree 0', function () {
      const spline = new BSpline({ points: [0, 1] })
      assert.equal(spline.eval(0), 1)
      assert.equal(spline.eval(1), 0)
    })

    it('correctly evaluates a B-spline of degree 2', function () {
      const spline = new BSpline({ points: [0, 1, 2, 3] })
      assert.equal(spline.eval(0), 0)
      assert.equal(spline.eval(1), 1 / 6)
      assert.equal(spline.eval(2), 1 / 6)
      assert.equal(spline.eval(3), 0)
    })
  })
})
