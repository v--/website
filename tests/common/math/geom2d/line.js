import { describe, it, assert } from '../../../_common.js'

import { Line } from '../../../../code/common/math/geom2d/line.js'
import { Vector } from '../../../../code/common/math/geom2d/vector.js'

describe('Line', function () {
  describe('.fromPointAndVector()', function () {
    it('works correctly', function () {
      const point = new Vector(-1, -1)
      const vector = new Vector(1, 1)
      const line = Line.fromPointAndVector(point, vector)

      assert.isTrue(line.coincidesWith(new Line(1, -1, 0)))
    })
  })

  describe('#intersectLines()', function () {
    it('intersects non-collinear lines', function () {
      const l = new Line(1, -1, 0)
      const m = new Line(1, 1, 0)
      const intersection = l.intersectWith(m)
      assert.equal(intersection.getNorm(), 0)
    })

    it('fails to intersect a line with itself', function () {
      const line = new Line(1, -1, 0)
      const intersection = line.intersectWith(line)

      assert.equal(intersection, null)
    })

    it('fails to intersect parallel lines', function () {
      const l = new Line(1, -1, 0)
      const m = new Line(1, -1, 1)
      const intersection = l.intersectWith(m)

      assert.equal(intersection, null)
    })
  })
})
