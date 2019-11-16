import { assert } from '../../../_common.js'
import { sort } from '../../../../code/common/support/iteration.js'
import { roundNumber } from '../../../../code/common/math/numeric/floating.js'

import { Matrix } from '../../../../code/common/math/linalg/matrix.js'
import { eigen } from '../../../../code/common/math/linalg/eigen.js'

describe('eigen()', function () {
  it('computes the eigendecomposition of a unit matrix', function () {
    const matrix = Matrix.unit(3)
    const { l, d } = eigen(matrix)
    assert.customEqual(l.mult(d), matrix.mult(l))
  })

  it('computes the eigendecomposition of a nonsingular 2x2 matrix', function () {
    const matrix = Matrix.fromRows([
      [2, 1],
      [1, 2]
    ])

    const { l, d } = eigen(matrix)
    assert.customEqual(l.mult(d), matrix.mult(l))
    assert.sameMembers(sort(d.getDiagonal().map(roundNumber)), [1, 3])
  })

  it('computes the eigendecomposition of a nonsingular matrix with a multidimensional eigenspace', function () {
    const matrix = Matrix.fromRows([
      [1, -2, -2],
      [-2, 1, -2],
      [-2, -2, 1]
    ])

    const { l, d } = eigen(matrix)
    assert.customEqual(l.mult(d), matrix.mult(l))
    assert.sameMembers(sort(d.getDiagonal().map(roundNumber)), [-3, 3, 3])
  })

  it('computes the eigendecomposition of a singular matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 2],
      [2, 4]
    ])

    const { l, d } = eigen(matrix)
    assert.customEqual(l.mult(d), matrix.mult(l))
    assert.sameMembers(sort(d.getDiagonal().map(roundNumber)), [0, 5])
  })
})
