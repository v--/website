import { assert } from '../../../_common.js'

import { norm } from '../../../../code/client/breakout/geom/vector.js'
import { fromPointAndVector, intersectLines } from '../../../../code/client/breakout/geom/line.js'

describe('fromPointAndVector()', function () {
  it('works correctly', function () {
    const point = { x: -1, y: -1 }
    const vector = { x: 1, y: 1 }
    const line = fromPointAndVector(point, vector)

    assert.deepEqual(line, { a: 1, b: -1, c: 0 })
  })
})

describe('intersectLines()', function () {
  it('intersects non-collinear lines', function () {
    const l = { a: 1, b: -1, c: 0 }
    const m = { a: 1, b: 1, c: 0 }
    const intersection = intersectLines(l, m)

    assert.equal(norm(intersection), 0)
  })

  it('fails to intersect a line with itself', function () {
    const line = { a: 1, b: -1, c: 0 }
    const intersection = intersectLines(line, line)

    assert.equal(intersection, null)
  })

  it('fails to intersect parallel lines', function () {
    const l = { a: 1, b: -1, c: 0 }
    const m = { a: 1, b: -1, c: 1 }
    const intersection = intersectLines(l, m)

    assert.equal(intersection, null)
  })
})
