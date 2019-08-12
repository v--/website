import { assert } from '../../../_common.js'

import { dist, add } from '../../../../code/client/breakout/geom/vector.js'

describe('angleBetweenLines()', function () {
  it('chooses the smaller intersection angle', function () {
    const u = { x: -1, y: -1 }
    const v = { x: 0, y: 0 }
    const w = { x: 1, y: 1 }
    const t = add(v, { x: 1 / 2, y: 1 / 2 })

    assert.isAbove(dist(u, t), dist(w, t))
  })
})
