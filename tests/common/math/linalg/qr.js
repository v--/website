import { describe, it, assert } from '../../../_common.js'

import { sort } from '../../../../code/common/support/iteration.js'
import { Matrix, MatrixDimensionError } from '../../../../code/common/math/linalg/matrix.js'
import { qr, det, eigenvalues } from '../../../../code/common/math/linalg/qr.js'

describe('qr()', function () {
  it('fails if the matrix is nonsquare', function () {
    const matrix = Matrix.fromRows([[1, 2]])

    assert.throws(function () {
      qr(matrix)
    }, MatrixDimensionError)
  })

  it('decomposes a unit matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 0],
      [0, 1]
    ])

    const { q, r } = qr(matrix)
    assert.customEqual(q.mult(r), matrix)
  })

  it('decomposes a 5x5 nonsingular matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3, 4, 5],
      [2, 1, 4, 5, 6],
      [3, 4, 1, 6, 7],
      [4, 5, 6, 1, 8],
      [5, 6, 7, 8, 1]
    ])

    const { q, r } = qr(matrix)
    assert.customEqual(q.mult(r), matrix)
  })

  it('q is orthogonal', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10]
    ])

    const { q } = qr(matrix)
    assert.customEqual(q.mult(q.transpose()), Matrix.unit(3))
  })

  it('r is upper triangular', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10]
    ])

    const { r } = qr(matrix)
    assert.sameNumber(r.get(1, 0), 0)
    assert.sameNumber(r.get(2, 0), 0)
    assert.sameNumber(r.get(2, 1), 0)
  })
})

describe('det()', function () {
  it('computes the determinant of a unit matrix', function () {
    const matrix = Matrix.unit(5)
    assert.sameNumber(det(matrix), 1)
  })

  it('computes the determinant of a 2x2 nonsingular matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 2],
      [4, 5]
    ])

    assert.sameNumber(det(matrix), 3)
  })

  it('computes the determinant of a 2x2 singular matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 2],
      [4, 8]
    ])

    assert.sameNumber(det(matrix), 0)
  })

  it('computes the determinant of a 5x5 nonsingular matrix', function () {
    const matrix = Matrix.fromRows([
      [1, 2, 3, 4, 5],
      [2, 1, 4, 5, 6],
      [3, 4, 1, 6, 7],
      [4, 5, 6, 1, 8],
      [5, 6, 7, 8, 1]
    ])

    assert.sameNumber(det(matrix), 2304)
  })

  it('throws when trying to compute the determinant of a nonsquare matrix', function () {
    const matrix = Matrix.fromRows([[1, 2]])

    assert.throws(function () {
      det(matrix)
    }, MatrixDimensionError)
  })
})

describe('eigenvalues()', function () {
  it('computes the sole eigenvalue of a unit matrix', function () {
    const matrix = Matrix.unit(3)

    assert.deepEqual(
      sort(eigenvalues(matrix)),
      [1]
    )
  })

  it('computes the eigenvalues of a 2x2 matrix', function () {
    const matrix = Matrix.fromRows([
      [2, 1],
      [1, 2]
    ])

    assert.deepEqual(
      sort(eigenvalues(matrix)),
      [1, 3]
    )
  })
})
