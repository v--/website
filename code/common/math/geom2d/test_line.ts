import { describe, it, assert } from '../../../_test_common'

import { Line } from './line.js'
import { Vector } from './vector.js'

describe('Line', function() {
  describe('.fromPointAndVector()', function() {
    it('works correctly', function() {
      const point = new Vector({ x: -1, y: -1 })
      const vector = new Vector({ x: 1, y: 1 })
      const line = Line.fromPointAndVector(point, vector)

      assert.isTrue(line.coincidesWith(new Line({ a: 1, b: -1, c: 0 })))
    })
  })

  describe('#intersectLines()', function() {
    it('intersects non-collinear lines', function() {
      const l = new Line({ a: 1, b: -1, c: 0 })
      const m = new Line({ a: 1, b: 1, c: 0 })
      const intersection = /** @type {TGeom2D.IVector} */ (l.intersectWith(m))
      assert.equal(intersection.getNorm(), 0)
    })

    it('fails to intersect a line with itself', function() {
      const line = new Line({ a: 1, b: -1, c: 0 })
      const intersection = line.intersectWith(line)

      assert.equal(intersection, null)
    })

    it('fails to intersect parallel lines', function() {
      const l = new Line({ a: 1, b: -1, c: 0 })
      const m = new Line({ a: 1, b: -1, c: 1 })
      const intersection = l.intersectWith(m)

      assert.equal(intersection, null)
    })
  })
})
