import { assert } from '../../../_common.js'

import Matrix from '../../../../code/client/core/math/linalg/matrix.js'
import Graph from '../../../../code/client/core/math/graph.js'

describe('Graph', function () {
  describe('#getSymmetrizedLaplacian()', function () {
    it('calculates the Laplacian matrix of an undirected graph', function () {
      const incidence = [
        [0, 2],
        [1],
        [0, 2]
      ]

      const graph = new Graph(incidence)

      const expected = Matrix.fromRows([
        [1, 0, -1],
        [0, 0, 0],
        [-1, 0, 1]
      ])

      assert.customEqual(graph.getSymmetrizedLaplacian(), expected)
    })

    it('calculates the symmetrized Laplacian matrix of a directed graph', function () {
      const incidence = [
        [0, 2],
        [1],
        [0, 2]
      ]
      const graph = new Graph(incidence)

      const expected = Matrix.fromRows([
        [1, 0, -1],
        [0, 0, 0],
        [-1, 0, 1]
      ])

      assert.customEqual(graph.getSymmetrizedLaplacian(), expected)
    })
  })
})
