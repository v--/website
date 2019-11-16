import { assert } from '../../../../_common.js'

import { Matrix } from '../../../../../code/client/core/math/linalg/matrix.js'
import { Graph } from '../../../../../code/client/core/math/graphs/graph.js'

describe('Graph', function () {
  describe('#getSymmetrizedLaplacian()', function () {
    it('calculates the Laplacian matrix of an undirected graph', function () {
      const graph = Graph.fromArcs([
        { src: 0, dest: 2 },
        { src: 2, dest: 0 }
      ])

      const expected = Matrix.fromRows([
        [1, 0, -1],
        [0, 0, 0],
        [-1, 0, 1]
      ])

      assert.customEqual(graph.getSymmetrizedLaplacian(), expected)
    })

    it('calculates the symmetrized Laplacian matrix of a directed graph', function () {
      const graph = Graph.fromArcs([
        { src: 0, dest: 2 },
        { src: 1, dest: 2 }
      ])

      const expected = Matrix.fromRows([
        [1, 0, -1],
        [0, 1, -1],
        [-1, -1, 2]
      ])

      assert.customEqual(graph.getSymmetrizedLaplacian(), expected)
    })
  })
})
