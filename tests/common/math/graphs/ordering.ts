import { describe, it, assert } from '../../../_common.js'

import { Graph, GraphTraversalError } from '../../../../code/common/math/graphs/graph.js'
import { topologicalOrder } from '../../../../code/common/math/graphs/ordering.js'

describe('topologicalOrder()', function() {
  it('fails to sort the null graph', function() {
    const graph = new Graph()

    assert.throws(function() {
      topologicalOrder(graph, 0)
    }, GraphTraversalError)
  })

  it('sorts a graph with a single arc', function() {
    const graph = Graph.fromArcData([
      { src: 0, dest: 1 }
    ])

    const order = topologicalOrder(graph, 0)
    assert.deepEqual(order, [0, 1])
  })

  it('sorts a graph with a single (undirected) cycle', function() {
    const graph = Graph.fromArcData([
      { src: 0, dest: 1 },
      { src: 0, dest: 2 },
      { src: 1, dest: 2 }
    ])

    const order = topologicalOrder(graph, 0)
    assert.deepEqual(order, [0, 1, 2])
  })

  it('sorts a graph with a single (directed) cycle', function() {
    const graph = Graph.fromArcData([
      { src: 0, dest: 1 },
      { src: 1, dest: 2 },
      { src: 2, dest: 0 }
    ])

    const order = topologicalOrder(graph, 0)
    assert.deepEqual(order, [0, 1, 2])
  })
})
