import { assert } from '../../../../_common.js'

import Matrix, { MatrixDimensionError } from '../../../../../code/client/core/math/linalg/matrix.js'

describe('Matrix', function () {
  describe('#fromRows()', function () {
    it('constructs a matrix from a list of rows', function () {
      const matrix = Matrix.fromRows([
        [1, 2],
        [3, 4]
      ])

      assert.strictEqual(matrix.get(0, 0), 1)
      assert.strictEqual(matrix.get(0, 1), 2)
      assert.strictEqual(matrix.get(1, 0), 3)
      assert.strictEqual(matrix.get(1, 1), 4)
    })

    it('fails if there are no rows', function () {
      assert.throws(function () {
        Matrix.fromRows([])
      }, MatrixDimensionError)
    })

    it('fails if the rows have different sizes', function () {
      assert.throws(function () {
        Matrix.fromRows([
          [1, 2],
          [3, 4, 5]
        ])
      }, MatrixDimensionError)
    })
  })

  describe('#diagonal()', function () {
    it('constructs a diagonal matrix', function () {
      const matrix = Matrix.diagonal([1, 2, 3])
      const expected = Matrix.fromRows([
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3]
      ])

      assert.customEqual(matrix, expected)
    })
  })

  describe('#get()', function () {
    it('works correctly', function () {
      const matrix = new Matrix(2, 2, [1, 0, 0, 1])
      assert.strictEqual(matrix.get(0, 0), 1)
    })
  })

  describe('#set()', function () {
    it('works correctly', function () {
      const matrix = new Matrix(2, 2, [1, 0, 0, 1])
      const changed = matrix.set(0, 0, 0)
      assert.strictEqual(changed.get(0, 0), 0)
    })
  })

  describe('#add()', function () {
    it('adds two matrices elementwise', function () {
      const first = new Matrix(2, 2, [1, 0, 0, 1])
      const second = new Matrix(2, 2, [0, 1, 1, 0])
      const expected = new Matrix(2, 2, [1, 1, 1, 1])

      assert.customEqual(first.add(second), expected)
    })
  })

  describe('#scale()', function () {
    it('scales a matrix', function () {
      const matrix = Matrix.diagonal([1, 2])
      const expected = Matrix.diagonal([3, 6])

      assert.customEqual(matrix.scale(3), expected)
    })
  })

  describe('#transpose()', function () {
    it('leaves a diagonal matrix', function () {
      const matrix = Matrix.diagonal([1, 2])
      assert.customEqual(matrix.transpose(), matrix)
    })

    it('transposes a nonsquare matrix', function () {
      const matrix = Matrix.fromRows([
        [1, 2, 3],
        [4, 5, 6]
      ])

      const expected = Matrix.fromRows([
        [1, 4],
        [2, 5],
        [3, 6]
      ])

      assert.customEqual(matrix.transpose(), expected)
    })
  })

  describe('#mult()', function () {
    it('multiplies two square matrices', function () {
      const a = Matrix.fromRows([
        [1, 2],
        [3, 4]
      ])

      const b = Matrix.fromRows([
        [5, 6],
        [7, 8]
      ])

      const expected = Matrix.fromRows([
        [19, 22],
        [43, 50]
      ])

      assert.customEqual(a.mult(b), expected)
    })

    it('is invariant under multiplication with unit matrices', function () {
      const unit = Matrix.diagonal([1, 1])
      const matrix = Matrix.fromRows([
        [1, 2],
        [3, 4]
      ])

      assert.customEqual(unit.mult(matrix), matrix)
      assert.customEqual(matrix.mult(unit), matrix)
    })
  })
})
