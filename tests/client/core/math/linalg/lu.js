import { assert } from '../../../../_common.js'

import Matrix, { MatrixDimensionError } from '../../../../../code/client/core/math/linalg/matrix.js'
import { lu } from '../../../../../code/client/core/math/linalg/lu.js'

describe('lu()', function () {
  it('fails if the matrix is nonsquare', function () {
    const matrix = Matrix.fromRows([[1, 2]])

    assert.throws(function () {
      lu(matrix)
    }, MatrixDimensionError)
  })

  it('decomposes a unit matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 0],
      [0, 1]
    ])

    const { l, u } = lu(matrix)

    assert.customEqual(l, matrix)
    assert.customEqual(u, matrix)
  })

  it('produces matrices l and u that multiply to the pivoted original when it has a nonzero diagonal', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10]
    ])

    const { l, u, p } = lu(matrix)
    assert.customEqual(l.mult(u), p.mult(matrix))
  })

  it('produces matrices l and u that multiply to the pivoted original', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3],
      [4, 8, 6],
      [7, 8, 10]
    ])

    const { l, u, p } = lu(matrix)
    assert.customEqual(l.mult(u), p.mult(matrix))
  })

  it('l is lower triangular', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10]
    ])

    const { l } = lu(matrix)
    assert.strictEqual(l.get(0, 1), 0)
    assert.strictEqual(l.get(0, 2), 0)
    assert.strictEqual(l.get(1, 2), 0)
  })

  it('u is upper triangular', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10]
    ])

    const { u } = lu(matrix)
    assert.strictEqual(u.get(1, 0), 0)
    assert.strictEqual(u.get(2, 0), 0)
    assert.strictEqual(u.get(2, 1), 0)
  })
})
